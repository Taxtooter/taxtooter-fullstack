import express from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all consultants (Admin only)
router.get('/consultants', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const consultants = await User.find({ role: 'consultant' }).select('_id name email');
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching consultants' });
  }
});

export default router; 