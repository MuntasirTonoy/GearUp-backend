import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProviderService } from './provider.service';
import httpStatus from 'http-status';

const createProvider = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ProviderService.createProvider(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Provider profile created successfully',
    data: result,
  });
});

const getAllProviders = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.getAllProviders();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Providers retrieved successfully',
    data: result,
  });
});

const getProviderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ProviderService.getProviderById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider retrieved successfully',
    data: result,
  });
});

const updateProvider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  const result = await ProviderService.updateProvider(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider profile updated successfully',
    data: result,
  });
});

export const ProviderController = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
};
