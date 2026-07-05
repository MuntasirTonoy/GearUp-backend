import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { verifyToken } from '../utils/jwt';
import config from '../config';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';

// Extend Express Request object to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'You are not authorized',
      });
      return;
    }

    const decoded = verifyToken(token, config.jwt.accessSecret);

    if (typeof decoded === 'string') {
      res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token payload',
      });
      return;
    }

    const { role } = decoded as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as string)) {
      res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to perform this action',
      });
      return;
    }

    req.user = decoded;
    next();
  });
};

export default auth;
