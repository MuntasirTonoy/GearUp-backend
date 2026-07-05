import { Router } from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/initiate",
  auth(Role.CUSTOMER),
  PaymentController.initiatePayment,
);
router.post("/success", PaymentController.handleSuccessWebhook);
router.post("/fail", PaymentController.handleFailWebhook);

router.get(
  "/my-payments",
  auth(Role.CUSTOMER),
  PaymentController.getMyPayments,
);

router.get(
  "/:rentalId",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  PaymentController.getPaymentDetails,
);

export const PaymentRoutes = router;
