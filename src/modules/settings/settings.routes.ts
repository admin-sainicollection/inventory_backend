import express from "express";
import { saveSettings, fetchSettings, updateSettingsController } from "./settings.controller";

const router = express.Router();

router.get("/", fetchSettings);
router.post("/", saveSettings);
router.put("/", updateSettingsController);

export default router;