import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { ImageUploadService } from './imageUpload.service.js';
import httpStatus from 'http-status';

const uploadSingle = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No image file provided. Please attach an image with field name "image".',
    });
    return;
  }

  const result = await ImageUploadService.uploadSingleImage(
    file,
    'gearup/uploads'
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image uploaded successfully',
    data: result,
  });
});

const uploadMultiple = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No image files provided. Please attach images with field name "images".',
    });
    return;
  }

  const results = await ImageUploadService.uploadMultipleImages(
    files,
    'gearup/uploads'
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${results.length} image(s) uploaded successfully`,
    data: { images: results },
  });
});

export const ImageUploadController = {
  uploadSingle,
  uploadMultiple,
};
