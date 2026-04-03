import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose CastError — invalid ObjectId
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
    return;
  }

  // Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
    return;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      error: 'Duplicate entry',
    });
    return;
  }

  // Default: Internal server error
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

// 404 handler — must be registered AFTER all routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}
