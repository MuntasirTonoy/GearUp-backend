import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';
import httpStatus from 'http-status';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review added successfully',
    data: result,
  });
});

const getFeaturedReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getFeaturedReviews();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured reviews retrieved successfully',
    data: result,
  });
});

const getReviewsByGearId = catchAsync(async (req: Request, res: Response) => {
  const { gearId } = req.params as { gearId: string };
  
  const result = await ReviewService.getReviewsByGearId(gearId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  await ReviewService.deleteReview(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getFeaturedReviews,
  getReviewsByGearId,
  deleteReview,
};
