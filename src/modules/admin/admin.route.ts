import { Router } from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(auth(Role.ADMIN));

router.get("/users", AdminController.getAllUsers);

router.patch("/users/:id/block", AdminController.toggleUserBlock);

router.get("/providers", AdminController.getProviderRequests);
router.patch("/providers/:id/approve", AdminController.approveProvider);

router.get("/gears", AdminController.getAllGears);

router.get("/rentals", AdminController.getAllRentals);
router.get("/payments", AdminController.getAllPayments);

export const AdminRoutes = router;
