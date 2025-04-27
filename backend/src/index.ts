import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import queryRoutes from './routes/queries';
import usersRouter from './routes/users';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/users', usersRouter);

// Register upload route and serve static files
import uploadRouter from './routes/upload';
import path from 'path';
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxtooter')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Create default admin user if not exists
    const User = (await import('./models/User')).default;
    const adminEmail = 'nischaya.gq@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Nischaya Sharma',
        email: adminEmail,
        password: 'password123#',
        role: 'admin'
      });
      console.log('Default admin user created.');
    } else {
      console.log('Admin user already exists.');
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 