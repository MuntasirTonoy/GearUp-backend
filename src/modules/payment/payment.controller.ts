import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import httpStatus from 'http-status';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const { rentalId } = req.body;
  
  const result = await PaymentService.initiatePayment(customerId, rentalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

const handleSuccessWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const rawBody = req.body; // Buffer injected by express.raw()

  const result = await PaymentService.handleStripeWebhook(signature, rawBody, 'success');

  res.status(200).json(result);
});

const handleFailWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const rawBody = req.body; // Buffer injected by express.raw()

  const result = await PaymentService.handleStripeWebhook(signature, rawBody, 'fail');

  res.status(200).json(result);
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const { rentalId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  
  const result = await PaymentService.getPaymentByRentalId(rentalId, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  handleSuccessWebhook,
  handleFailWebhook,
  getPaymentDetails,
};
