import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rental.service";
import httpStatus from "http-status";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await RentalService.createRental(customerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Rental booking created successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await RentalService.getMyRentals(customerId, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your rentals retrieved successfully",
    data: result.data,
    meta: result.meta,
  } as any);
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await RentalService.getRentalById(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental details retrieved successfully",
    data: result,
  });
});

const getProviderRentals = catchAsync(async (req: Request, res: Response) => {
  const providerUserId = req.user?.id;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await RentalService.getProviderRentals(providerUserId, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider rentals retrieved successfully",
    data: result.data,
    meta: result.meta,
  } as any);
});

const cancelRental = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const customerId = req.user?.id;

  const result = await RentalService.cancelRental(id, customerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental cancelled successfully",
    data: result,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await RentalService.updateRentalStatus(
    id,
    userId,
    userRole,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rental status updated successfully",
    data: result,
  });
});

export const RentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  getProviderRentals,
  cancelRental,
  updateRentalStatus,
};
