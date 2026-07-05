import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import httpStatus from "http-status";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.toggleUserBlock(id);
  const action = result.isDeleted ? "blocked" : "unblocked";
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${action} successfully`,
    data: result,
  });
});

const getProviderRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getProviderRequests();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider onboarding requests retrieved successfully",
    data: result,
  });
});

const approveProvider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.approveProvider(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider approved successfully",
    data: result,
  });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllGears();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All gear listings retrieved successfully",
    data: result,
  });
});

const getAllRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllRentals();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rentals retrieved successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllPayments();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  toggleUserBlock,
  getProviderRequests,
  approveProvider,
  getAllGears,
  getAllRentals,
  getAllPayments,
};
