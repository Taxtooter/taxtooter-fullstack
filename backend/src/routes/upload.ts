import express, { Request } from "express";
import multer from "multer";
// @ts-ignore
import multerS3 from "multer-s3";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { logger } from "../utils/logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = express.Router();

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

const getFolderPrefix = () => {
    if (process.env.NODE_ENV === "production") {
        return "prod/";
    } else {
        return "local/";
    }
};

const BUCKET_NAME = requiredEnvVars.S3_BUCKET_NAME as string;
logger.info("Using S3 bucket:", { bucketName: BUCKET_NAME });

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

// POST /api/upload
router.post("/", upload.single("file"), (req: Request, res) => {
    // @ts-ignore
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    // @ts-ignore
    res.json({ url: file.location, key: file.key });
});

// GET /api/upload/signed-url?key=...
router.get("/signed-url", async (req, res) => {
    const { key } = req.query;
    if (!key || typeof key !== "string") {
        return res.status(400).json({ error: "Missing or invalid file key" });
    }
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes
        res.json({ url });
    } catch (err) {
        logger.error("Failed to generate signed URL", { error: err });
        res.status(500).json({ error: "Failed to generate signed URL" });
    }
});

export default router;
