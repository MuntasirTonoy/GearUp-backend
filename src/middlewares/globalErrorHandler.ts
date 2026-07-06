import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import httpStatus from 'http-status';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';

  // ─── Multer Errors (file upload) ───
  if (err instanceof multer.MulterError) {
    statusCode = httpStatus.BAD_REQUEST;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum file size is 5 MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 5 files per upload.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected file field: "${err.field}". Please check the field name.`;
        break;
      default:
        message = `File upload error: ${err.message}`;
    }
  }

  // ─── Custom file filter errors (MIME type / extension) ───
  if (err.message?.includes('Invalid file type') || err.message?.includes('Invalid file extension')) {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.message;
  }

  // ─── Prisma Errors ───
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
