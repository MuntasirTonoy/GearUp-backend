import { prisma } from "../../lib/prisma";
import stripe from "../../lib/payment";
import config from "../../config";
import httpStatus from "http-status";

const initiatePayment = async (customerId: string, rentalId: string) => {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: {
      gear: true,
      customer: true,
    },
  });

  if (!rental) {
    const error: any = new Error("Rental not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (rental.customerId !== customerId) {
    const error: any = new Error(
      "You are not authorized to pay for this rental",
    );
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  if (rental.status !== "PLACED") {
    const error: any = new Error(
      `Rental must be PLACED before payment. Current status: ${rental.status}`,
    );
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { rentalId },
  });

  if (existingPayment && existingPayment.paymentStatus === "PAID") {
    const error: any = new Error("Payment already completed for this rental");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: rental.gear.name,
            description: `Rental for ${rental.totalDays} days`,
          },
          unit_amount: Math.round(rental.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl}/payment/fail`,
    client_reference_id: rentalId,
    customer_email: rental.customer.email,
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { rentalId },
      data: {
        transactionId: session.id,
        paymentStatus: "PENDING",
        paymentMethod: "stripe",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        rentalId,
        transactionId: session.id,
        amount: rental.totalAmount,
        paymentStatus: "PENDING",
        paymentMethod: "stripe",
      },
    });
  }

  return { url: session.url };
};

const handleStripeWebhook = async (
  signature: string,
  rawBody: Buffer,
  type: "success" | "fail",
) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.payment.stripeWebhookSecret,
    );
  } catch (err: any) {
    const error: any = new Error(`Webhook Error: ${err.message}`);
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (type === "success" && event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const rentalId = session.client_reference_id;

    if (rentalId) {
      await prisma.payment.update({
        where: { rentalId },
        data: { paymentStatus: "PAID" },
      });
    }
  } else if (
    type === "fail" &&
    (event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired")
  ) {
    const session: any = event.data.object;
    const rentalId = session.client_reference_id;

    if (rentalId) {
      await prisma.payment.update({
        where: { rentalId },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return { received: true };
};

const getMyPayments = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      rental: {
        customerId,
      },
    },
    include: {
      rental: {
        select: {
          startDate: true,
          endDate: true,
          totalDays: true,
          status: true,
          gear: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getPaymentByRentalId = async (
  rentalId: string,
  userId: string,
  userRole: string,
) => {
  const payment = await prisma.payment.findUnique({
    where: { rentalId },
    include: {
      rental: {
        include: {
          gear: {
            include: { provider: true },
          },
        },
      },
    },
  });

  if (!payment) {
    const error: any = new Error("Payment details not found");
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const isCustomer = payment.rental.customerId === userId;
  const isProvider = payment.rental.gear.provider.userId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCustomer && !isProvider && !isAdmin) {
    const error: any = new Error("You are not authorized to view this payment");
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  return payment;
};

export const PaymentService = {
  initiatePayment,
  handleStripeWebhook,
  getMyPayments,
  getPaymentByRentalId,
};
