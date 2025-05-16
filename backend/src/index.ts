import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import queryRoutes from "./routes/queries";
import usersRouter from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import uploadRouter from "./routes/upload";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import { logger } from "./utils/logger";
import fs from "fs";
import { supabase } from "./config/supabase";
import { initializeRedis } from "./config/redis";
import User from "./models/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRouter);

// Register upload route and serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 404 handler
app.use((req, res, next) => {
    logger.warn("Route not found", {
        method: req.method,
        url: req.url,
        ip: req.ip,
    });
    res.status(404).json({
        success: false,
        error: "Not Found",
        message: "The requested resource was not found",
    });
});

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

// Initialize app
const initializeApp = async () => {
    try {
        // Initialize Redis
        await initializeRedis();

        // Create default admin user if not exists
        const adminEmail = "troubleshooter.xyz@gmail.com";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                name: "Admin",
                email: adminEmail,
                password: "password123#",
                role: "admin",
            });
            logger.info("Default admin user created");
        } else {
            logger.info("Admin user already exists");
        }

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Error initializing app:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        process.exit(1);
    }
};

initializeApp();
