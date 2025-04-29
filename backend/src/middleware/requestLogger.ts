import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const start = Date.now();

    // Log request
    logger.info("Incoming request", {
        method: req.method,
        url: req.url,
        ip: req.ip,
    });

    // Capture response data
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info("Outgoing response", {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
