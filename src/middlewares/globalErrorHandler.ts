import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = httpStatus.CONFLICT;
      message = 'Duplicate entry found. The value must be unique.';
    } else if (err.code === 'P2003') {
      statusCode = httpStatus.BAD_REQUEST;
      message = 'Foreign key constraint failed.';
    } else if (err.code === 'P2025') {
      statusCode = httpStatus.NOT_FOUND;
      message = 'Record not found.';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Prisma validation error. Please check your input data.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: err,
    stack: config.env === 'development' ? err.stack : undefined,
  });
};

export default globalErrorHandler;
