import express from "express";
import { SettingsController } from "./settings.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/", SettingsController.getSettings);
router.patch("/", auth(Role.ADMIN), SettingsController.updateSettings);

export const SettingsRoutes = router;
