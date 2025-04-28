import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';

export interface UserPayload {
  id: string;
  role: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Authenticating request', {
      method: req.method,
      url: req.url,
      headers: req.headers
    });

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserPayload;
    logger.info('Token decoded', { decoded });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn('User not found', { userId: decoded.id });
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: decoded.name
    };
    logger.info('Authentication successful', { user: req.user });
    next();
  } catch (error) {
    logger.error('Authentication error', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    logger.info('Authorizing request', {
      user: req.user,
      requiredRoles: roles
    });

    if (!req.user) {
      logger.warn('No user in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied', {
        userRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    logger.info('Authorization successful');
    next();
  };
}; 