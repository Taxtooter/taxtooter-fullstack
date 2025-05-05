import express, { Request } from "express";
import multer from "multer";
// @ts-ignore
import multerS3 from "multer-s3";
import AWS from "aws-sdk";

const router = express.Router();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const getFolderPrefix = () => {
    if (process.env.NODE_ENV === "production") {
        return "prod/";
    } else {
        return "local/";
    }
};

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "taxtooter-uploads";
console.log("Using S3 bucket:", BUCKET_NAME);

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        acl: "private",
        key: function (req: Express.Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) {
            const folder = getFolderPrefix();
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

export default router;
