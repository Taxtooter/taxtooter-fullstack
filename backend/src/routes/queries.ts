import express from "express";
import Query from "../models/Query";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import User from "../models/User";
import { logger } from "../utils/logger";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { cacheMiddleware, clearCache } from "../middleware/cache";

const router = express.Router();

// Define the S3 file type
interface S3File extends Express.Multer.File {
    location: string;
    key: string;
}

// Validate required environment variables
const requiredEnvVars = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME
};

// Check if any required environment variables are missing
const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    logger.error("Missing required environment variables:", { missingEnvVars });
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

// Create AWS credentials object
const credentials: AwsCredentialIdentity = {
    accessKeyId: requiredEnvVars.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: requiredEnvVars.AWS_SECRET_ACCESS_KEY as string
};

const s3Client = new S3Client({
    region: requiredEnvVars.AWS_REGION as string,
    credentials
});

const BUCKET_NAME = requiredEnvVars.S3_BUCKET_NAME as string;

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: BUCKET_NAME,
        acl: "private",
        key: function (req: Express.Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) {
            const folder = process.env.NODE_ENV === "production" ? "prod/" : "local/";
            cb(null, folder + Date.now() + "-" + file.originalname);
        },
    }),
});

// Get my queries (customer)
router.get(
    "/my-queries",
    authenticate,
    authorize(["customer"]),
    cacheMiddleware(300),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res.status(401).json({ message: "Authentication required" });
            }
            logger.info("Fetching queries for customer", {
                userId: req.user.id,
            });
            const queries = await Query.find({ customer_id: req.user.id });
            logger.info(`Found ${queries.length} queries for customer`);
            res.json(queries);
        } catch (error) {
            logger.error("Error fetching customer queries", error);
            res.status(500).json({ message: "Error fetching queries" });
        }
    },
);

// Create a new query (customer only)
router.post(
    "/",
    authenticate,
    authorize(["customer"]),
    upload.single("file"),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res.status(401).json({ message: "Authentication required" });
            }
            logger.info("Creating new query for user", { userId: req.user.id });
            const { title, description } = req.body;

            // @ts-ignore
            const file = req.file as S3File;
            const fileInfo = file
                ? {
                    filename: file.originalname,
                    path: file.location,
                    key: file.key
                }
                : null;

            const query = await Query.create({
                title,
                description,
                customer_id: req.user.id,
                status: "open"
            });

            // Clear cache for user's queries
            await clearCache(`/api/queries/my-queries`);

            logger.info("Query created successfully", { queryId: query.id });
            res.status(201).json(query);
        } catch (error) {
            logger.error("Error creating query", error);
            res.status(500).json({ message: "Error creating query" });
        }
    },
);

// Get all queries (admin only)
router.get(
    "/",
    authenticate,
    authorize(["admin"]),
    cacheMiddleware(300),
    async (req: AuthRequest, res) => {
        try {
            logger.info("Fetching all queries for admin");
            const queries = await Query.find({});
            logger.info(`Found ${queries.length} queries`);
            res.json(queries);
        } catch (error) {
            logger.error("Error fetching all queries", error);
            res.status(500).json({ message: "Error fetching queries" });
        }
    },
);

// Assign query to consultant (Admin only)
router.post(
    "/:id/assign",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            const { consultantId } = req.body;
            logger.info("Assigning query", {
                queryId: req.params.id,
                consultantId,
            });

            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }

            const consultant = await User.findById(consultantId);
            if (!consultant || consultant.role !== "consultant") {
                logger.warn("Invalid consultant", { consultantId });
                return res.status(400).json({ message: "Invalid consultant" });
            }

            const updatedQuery = await Query.update(req.params.id, {
                consultant_id: consultantId,
                status: "assigned"
            });

            if (!updatedQuery) {
                return res.status(500).json({ message: "Error assigning query" });
            }

            // Clear cache for both admin and user queries
            await clearCache(`/api/queries`);
            await clearCache(`/api/queries/my-queries`);

            logger.info("Query assigned successfully", { queryId: updatedQuery.id });
            res.json(updatedQuery);
        } catch (error) {
            logger.error("Error assigning query", error);
            res.status(500).json({ message: "Error assigning query" });
        }
    },
);

// Respond to a query
router.post(
    "/:id/respond",
    authenticate,
    authorize(["consultant", "customer", "admin"]),
    upload.single("file"),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res.status(401).json({ message: "Authentication required" });
            }

            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }

            // Only consultants need to be assigned to the query
            if (
                req.user.role === "consultant" &&
                (!query.consultant_id ||
                    query.consultant_id !== req.user.id)
            ) {
                logger.warn("Unauthorized consultant response", {
                    userId: req.user.id,
                    queryConsultantId: query.consultant_id,
                });
                return res
                    .status(403)
                    .json({
                        message: "Not authorized to respond to this query",
                    });
            }

            // @ts-ignore
            const file = req.file as S3File;
            const fileInfo = file
                ? {
                    filename: file.originalname,
                    path: file.location,
                    key: file.key
                }
                : null;

            // Add the response to the responses array
            const response = {
                query_id: req.params.id,
                user_id: req.user.id,
                user_name: req.user.name,
                user_role: req.user.role,
                message: req.body.response,
                created_at: new Date().toISOString(),
                file_key: fileInfo ? fileInfo.key : null,
                file_path: fileInfo ? fileInfo.path : null,
                file_name: fileInfo ? fileInfo.filename : null,
            };

            const updatedQuery = await Query.addResponse(req.params.id, response);
            if (!updatedQuery) {
                return res.status(500).json({ message: "Error adding response" });
            }

            // Clear cache for both admin and user queries
            await clearCache(`/api/queries`);
            await clearCache(`/api/queries/my-queries`);

            logger.info("Response with file added successfully to query", {
                queryId: updatedQuery.id,
            });
            res.json(updatedQuery);
        } catch (error) {
            logger.error("Error responding to query", error);
            res.status(500).json({ message: "Error responding to query" });
        }
    },
);

// GET /api/queries/assigned - Get queries assigned to the logged-in consultant
router.get(
    "/assigned",
    authenticate,
    authorize(["consultant"]),
    cacheMiddleware(300),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res.status(401).json({ message: "Authentication required" });
            }
            logger.info("Fetching assigned queries for consultant", { userId: req.user.id });
            const queries = await Query.find({ consultant_id: req.user.id });
            logger.info(`Found ${queries.length} assigned queries for consultant`);
            res.json(queries);
        } catch (error) {
            logger.error("Error fetching assigned queries", error);
            res.status(500).json({ message: "Error fetching assigned queries" });
        }
    }
);

// Get a query by ID (admin, assigned consultant, or customer who owns it)
router.get(
    "/:id",
    authenticate,
    async (req: AuthRequest, res) => {
        try {
            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }

            // Only allow access if admin, assigned consultant, or the customer who owns the query
            const user = req.user;
            // Add logging for debugging
            logger.info("Authorization check for query access", {
                userId: user?.id,
                userIdType: typeof user?.id,
                customerId: query.customer_id,
                customerIdType: typeof query.customer_id,
                consultantId: query.consultant_id,
                consultantIdType: typeof query.consultant_id,
            });
            if (
                user?.role !== "admin" &&
                String(user?.id) !== String(query.customer_id) &&
                String(user?.id) !== String(query.consultant_id)
            ) {
                logger.warn("Unauthorized access to query", { userId: user?.id, queryId: query.id });
                return res.status(403).json({ message: "Not authorized to view this query" });
            }

            res.json(query);
        } catch (error) {
            logger.error("Error fetching query by ID", error);
            res.status(500).json({ message: "Error fetching query" });
        }
    }
);

// Resolve a query (admin or assigned consultant)
router.post(
    "/:id/resolve",
    authenticate,
    authorize(["admin", "consultant"]),
    async (req: AuthRequest, res) => {
        try {
            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }

            // Only admin or assigned consultant can resolve
            const user = req.user;
            if (
                user?.role !== "admin" &&
                user?.id !== query.consultant_id
            ) {
                logger.warn("Unauthorized resolve attempt", { userId: user?.id, queryId: query.id });
                return res.status(403).json({ message: "Not authorized to resolve this query" });
            }

            const updatedQuery = await Query.update(req.params.id, { status: "resolved" });
            if (!updatedQuery) {
                return res.status(500).json({ message: "Error resolving query" });
            }

            // Clear cache for both admin and user queries
            await clearCache(`/api/queries`);
            await clearCache(`/api/queries/my-queries`);

            logger.info("Query resolved successfully", { queryId: updatedQuery.id });
            res.json(updatedQuery);
        } catch (error) {
            logger.error("Error resolving query", error);
            res.status(500).json({ message: "Error resolving query" });
        }
    }
);

export default router;
