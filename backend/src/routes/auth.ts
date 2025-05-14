import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { authenticate, AuthRequest, authorize } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate role
        if (!["admin", "consultant", "customer"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            name,
            role,
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1d" },
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error("Registration error", error);
        res.status(500).json({ message: "Error creating user" });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await User.comparePassword(user, password);
        if (!isMatch) {
            logger.warn("Password mismatch for user", { email });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1d" },
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error("Login error", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Authentication required
 */
router.get("/me", authenticate, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await User.findById(req.user.id, "-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
    } catch (error) {
        logger.error("Get current user error", error);
        res.status(500).json({ message: "Error fetching user" });
    }
});

// Get all consultants (Admin only)
router.get(
    "/users/consultants",
    authenticate,
    authorize(["admin"]),
    async (req, res) => {
        try {
            const consultants = await User.find({ role: "consultant" }, "id name email");
            res.json(consultants);
        } catch (error) {
            res.status(500).json({ message: "Error fetching consultants" });
        }
    },
);

export default router;
