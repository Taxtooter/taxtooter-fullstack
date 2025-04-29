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
            const consultants = await User.find({ role: "consultant" }).select(
                "_id name email",
            );
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
            logger.info("Fetching all users", {
                user: req.user,
                headers: req.headers,
            });
            const users = await User.find().select("_id name email role");
            logger.info(`Found ${users.length} users`);
            res.json(users);
        } catch (error) {
            logger.error("Error fetching users", error);
            res.status(500).json({ message: "Error fetching users" });
        }
    },
);

// Get user profile
router.get("/profile", authenticate, async (req: AuthRequest, res) => {
    try {
        logger.info("Fetching user profile", { userId: req.user?.id });
        const user = await User.findById(req.user?.id).select("-password");
        if (!user) {
            logger.warn("User profile not found", { userId: req.user?.id });
            return res.status(404).json({ message: "User not found" });
        }
        logger.info("User profile fetched successfully");
        res.json(user);
    } catch (error) {
        logger.error("Error fetching profile", error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// Update user profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
    try {
        logger.info("Updating user profile", { userId: req.user?.id });
        const { name, email, password } = req.body;
        const user = await User.findById(req.user?.id);

        if (!user) {
            logger.warn("User not found for profile update", {
                userId: req.user?.id,
            });
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();
        logger.info("Profile updated successfully");
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        logger.error("Error updating profile", error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

// Update any user's profile (admin only)
router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    async (req: AuthRequest, res) => {
        try {
            logger.info("Admin updating user profile", {
                adminId: req.user?.id,
                targetUserId: req.params.id,
            });

            const { name, email, role } = req.body;
            const user = await User.findById(req.params.id);

            if (!user) {
                logger.warn("User not found for admin update", {
                    userId: req.params.id,
                });
                return res.status(404).json({ message: "User not found" });
            }

            if (name) user.name = name;
            if (email) user.email = email;
            if (role) user.role = role;

            await user.save();
            logger.info("User profile updated by admin successfully");
            res.json({ message: "User profile updated successfully" });
        } catch (error) {
            logger.error("Error updating user profile by admin", error);
            res.status(500).json({ message: "Error updating user profile" });
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
            logger.info("Deleting user", { userId: req.params.id });
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                logger.warn("User not found for deletion", {
                    userId: req.params.id,
                });
                return res.status(404).json({ message: "User not found" });
            }
            logger.info("User deleted successfully");
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            logger.error("Error deleting user", error);
            res.status(500).json({ message: "Error deleting user" });
        }
    },
);

export default router;
