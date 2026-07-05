import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
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
  const payload = req.body;

  const result = await UserService.updateMyProfile(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

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
