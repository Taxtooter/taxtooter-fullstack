import express from "express";
import User from "../models/User";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

/**
 * @swagger
 * /api/users/consultants:
 *   get:
 *     summary: Get all consultants (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of consultants
 */
router.get(
    "/consultants",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            logger.info("Fetching all consultants");
            const consultants = await User.find({ role: "consultant" }, "id,name,email");
            logger.info(`Found ${consultants.length} consultants`);
            res.json(consultants);
        } catch (error) {
            logger.error("Error fetching consultants", error);
            res.status(500).json({ message: "Error fetching consultants" });
        }
    },
);

// Get all users (admin only)
router.get(
    "/",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            logger.info("Fetching all users");
            const users = await User.find({});
            logger.info(`Found ${users.length} users`);
            res.json(users);
        } catch (error) {
            logger.error("Error fetching users", error);
            res.status(500).json({ message: "Error fetching users" });
        }
    },
);

// Get user by ID
router.get(
    "/:id",
    authenticate,
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            // Only allow users to view their own profile or admins to view any profile
            if (req.user.id !== req.params.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized" });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(user);
        } catch (error) {
            logger.error("Error fetching user", error);
            res.status(500).json({ message: "Error fetching user" });
        }
    },
);

// Get user profile
router.get("/profile", authenticate, async (req: AuthRequest, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }
        logger.info("Fetching user profile", { userId: req.user.id });
        const user = await User.findById(req.user.id, "-password");
        if (!user) {
            logger.warn("User profile not found", { userId: req.user.id });
            return res.status(404).json({ message: "User not found" });
        }
        logger.info("User profile fetched successfully");
        res.json(user);
    } catch (error) {
        logger.error("Error fetching profile", error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// Update user
router.put(
    "/:id",
    authenticate,
    async (req: AuthRequest, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            // Only allow users to update their own profile or admins to update any profile
            if (req.user.id !== req.params.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized" });
            }

            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Update user fields
            const updatedUser = await User.update(req.params.id, {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                role: req.user.role === "admin" ? (req.body.role || user.role) : user.role,
            });

            if (!updatedUser) {
                return res.status(500).json({ message: "Error updating user" });
            }

            res.json(updatedUser);
        } catch (error) {
            logger.error("Error updating user", error);
            res.status(500).json({ message: "Error updating user" });
        }
    },
);

// Delete user (admin only)
router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const deletedUser = await User.delete(req.params.id);
            if (!deletedUser) {
                return res.status(500).json({ message: "Error deleting user" });
            }

            res.json({ message: "User deleted successfully" });
        } catch (error) {
            logger.error("Error deleting user", error);
            res.status(500).json({ message: "Error deleting user" });
        }
    },
);

export default router;
