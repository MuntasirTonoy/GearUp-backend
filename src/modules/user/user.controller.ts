import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import { ImageUploadService } from '../imageUpload/imageUpload.service';
import httpStatus from 'http-status';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await UserService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const payload: Record<string, any> = {};

  // Parse text fields from form-data
  if (req.body.name) payload.name = req.body.name;
  if (req.body.phone) payload.phone = req.body.phone;

  // Upload profile photo if provided
  if (req.file) {
    const uploaded = await ImageUploadService.uploadSingleImage(
      req.file,
      'gearup/avatars'
    );
    payload.profilePhoto = uploaded.url;
  }

  const result = await UserService.updateMyProfile(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const result = await UserService.getPublicProfile(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Public profile retrieved successfully',
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
};
