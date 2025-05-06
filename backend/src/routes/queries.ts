import express from "express";
import mongoose from "mongoose";
import Query from "../models/Query";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import User from "../models/User";
import { logger } from "../utils/logger";
import multer from "multer";
// @ts-ignore
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";

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

// Get assigned queries (Consultant)
router.get(
    "/assigned",
    authenticate,
    authorize(["consultant"]),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res
                    .status(401)
                    .json({ message: "Authentication required" });
            }
            logger.info("Fetching assigned queries for consultant", {
                userId: req.user.id,
            });
            const queries = await Query.find({ consultant: req.user.id })
                .populate("customer", "name email")
                .populate("consultant", "name email");
            logger.info(`Found ${queries.length} assigned queries`);
            res.json(queries);
        } catch (error) {
            logger.error("Error fetching assigned queries", error);
            res.status(500).json({ message: "Error fetching queries" });
        }
    },
);

// Get my queries (customer)
router.get(
    "/my-queries",
    authenticate,
    authorize(["customer"]),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res
                    .status(401)
                    .json({ message: "Authentication required" });
            }
            logger.info("Fetching queries for customer", {
                userId: req.user.id,
            });
            const queries = await Query.find({ customer: req.user.id })
                .populate("customer", "name email")
                .populate("consultant", "name email");
            logger.info(`Found ${queries.length} queries for customer`);
            res.json(queries);
        } catch (error) {
            logger.error("Error fetching customer queries", error);
            res.status(500).json({ message: "Error fetching queries" });
        }
    },
);

/**
 * @swagger
 * /api/queries/{id}:
 *   get:
 *     summary: Get a single query by ID
 *     tags: [Queries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The query ID
 *     responses:
 *       200:
 *         description: Query details
 *       404:
 *         description: Query not found
 */
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
    try {
        logger.info("Fetching query with ID", { queryId: req.params.id });
        const query = await Query.findById(req.params.id)
            .populate("customer", "name email")
            .populate("consultant", "name email");

        if (!query) {
            logger.warn("Query not found", { queryId: req.params.id });
            return res.status(404).json({ message: "Query not found" });
        }

        // Check authorization
        if (
            req.user?.role === "customer" &&
            query.customer._id.toString() !== req.user.id
        ) {
            logger.warn("Unauthorized customer access", {
                userId: req.user.id,
                queryCustomerId: query.customer._id,
            });
            return res
                .status(403)
                .json({ message: "Not authorized to view this query" });
        }

        if (
            req.user?.role === "consultant" &&
            (!query.consultant ||
                query.consultant._id.toString() !== req.user.id)
        ) {
            logger.warn("Unauthorized consultant access", {
                userId: req.user.id,
                queryConsultantId: query.consultant?._id,
            });
            return res
                .status(403)
                .json({ message: "Not authorized to view this query" });
        }

        logger.info("Query fetched successfully", { queryId: query._id });
        res.json(query);
    } catch (error) {
        logger.error("Error fetching query", error);
        res.status(500).json({ message: "Error fetching query" });
    }
});

/**
 * @swagger
 * /api/queries:
 *   post:
 *     summary: Create a new query (customer only)
 *     tags: [Queries]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Query created
 */
router.post(
    "/",
    authenticate,
    authorize(["customer"]),
    upload.single("file"),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res
                    .status(401)
                    .json({ message: "Authentication required" });
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

            const query = new Query({
                title,
                description,
                customer: req.user.id,
                status: "open",
                responses: [{
                    user: {
                        _id: new mongoose.Types.ObjectId(req.user.id),
                        name: req.user.name,
                        role: req.user.role,
                    },
                    message: description,
                    createdAt: new Date(),
                    file: fileInfo,
                }]
            });
            await query.save();
            logger.info("Query created successfully", { queryId: query._id });
            res.status(201).json(query);
        } catch (error) {
            logger.error("Error creating query", error);
            res.status(500).json({ message: "Error creating query" });
        }
    },
);

/**
 * @swagger
 * /api/queries:
 *   get:
 *     summary: Get all queries (admin only)
 *     tags: [Queries]
 *     responses:
 *       200:
 *         description: List of queries
 */
router.get(
    "/",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            logger.info("Fetching all queries for admin");
            const queries = await Query.find()
                .populate("customer", "name email")
                .populate("consultant", "name email");
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

            query.consultant = new mongoose.Types.ObjectId(consultantId);
            query.status = "assigned";
            await query.save();
            logger.info("Query assigned successfully", { queryId: query._id });
            res.json(query);
        } catch (error) {
            logger.error("Error assigning query", error);
            res.status(500).json({ message: "Error assigning query" });
        }
    },
);

/**
 * @swagger
 * /api/queries/{id}/respond:
 *   post:
 *     summary: Respond to a query (consultant, admin, or customer)
 *     tags: [Queries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The query ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               response:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Response added to query
 */
router.post(
    "/:id/respond",
    authenticate,
    authorize(["consultant", "admin", "customer"]),
    upload.single("file"),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res
                    .status(401)
                    .json({ message: "Authentication required" });
            }

            logger.info("Responding to query", {
                queryId: req.params.id,
                userId: req.user.id,
                role: req.user.role,
            });

            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }

            // Check authorization based on role
            if (
                req.user.role === "customer" &&
                query.customer.toString() !== req.user.id
            ) {
                logger.warn("Unauthorized customer response", {
                    userId: req.user.id,
                    queryCustomerId: query.customer.toString(),
                });
                return res
                    .status(403)
                    .json({
                        message: "Not authorized to respond to this query",
                    });
            }

            // Prevent consultants from responding to resolved queries
            if (req.user.role === "consultant" && query.status === "resolved") {
                logger.warn(
                    "Consultant attempted to respond to resolved query",
                    {
                        userId: req.user.id,
                        queryId: query._id,
                    },
                );
                return res
                    .status(403)
                    .json({ message: "Cannot respond to a resolved query" });
            }

            // Only consultants need to be assigned to the query
            if (
                req.user.role === "consultant" &&
                (!query.consultant ||
                    query.consultant.toString() !== req.user.id)
            ) {
                logger.warn("Unauthorized consultant response", {
                    userId: req.user.id,
                    queryConsultantId: query.consultant?.toString(),
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
                user: {
                    _id: new mongoose.Types.ObjectId(req.user.id),
                    name: req.user.name,
                    role: req.user.role,
                },
                message: req.body.response,
                createdAt: new Date(),
                file: fileInfo,
            };

            if (!query.responses) {
                query.responses = [];
            }
            query.responses.push(response);

            await query.save();
            logger.info("Response with file added successfully to query", {
                queryId: query._id,
            });
            res.json(query);
        } catch (error) {
            logger.error("Error responding to query", error);
            res.status(500).json({ message: "Error responding to query" });
        }
    },
);

// Mark query as resolved (customer or admin only)
router.post(
    "/:id/resolve",
    authenticate,
    authorize(["customer", "admin"]),
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                logger.warn("No user found in request");
                return res
                    .status(401)
                    .json({ message: "Authentication required" });
            }
            logger.info("Resolving query", {
                queryId: req.params.id,
                userId: req.user.id,
                role: req.user.role,
            });
            const query = await Query.findById(req.params.id);
            if (!query) {
                logger.warn("Query not found", { queryId: req.params.id });
                return res.status(404).json({ message: "Query not found" });
            }
            // Only the customer who owns the query or an admin can resolve
            if (
                req.user.role === "customer" &&
                query.customer.toString() !== req.user.id
            ) {
                logger.warn("Unauthorized customer resolve attempt", {
                    userId: req.user.id,
                    queryCustomerId: query.customer.toString(),
                });
                return res
                    .status(403)
                    .json({ message: "Not authorized to resolve this query" });
            }
            query.status = "resolved";
            await query.save();
            logger.info("Query marked as resolved", { queryId: query._id });
            res.json(query);
        } catch (error) {
            logger.error("Error resolving query", error);
            res.status(500).json({ message: "Error resolving query" });
        }
    },
);

export default router;
