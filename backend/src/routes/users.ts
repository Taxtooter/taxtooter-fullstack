import express from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

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
router.get('/consultants', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const consultants = await User.find({ role: 'consultant' }).select('_id name email');
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultants' });
  }
});

export default router; 