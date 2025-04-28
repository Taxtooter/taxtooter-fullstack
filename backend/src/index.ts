import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import queryRoutes from './routes/queries';
import usersRouter from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import uploadRouter from './routes/upload';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/queries', queryRoutes);

// Register upload route and serve static files
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler
app.use((req, res, next) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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