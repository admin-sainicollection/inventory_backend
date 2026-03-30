import express from "express";
import { saveSettings, fetchSettings, updateSettingsController, clearUploads } from "./settings.controller";
import { upload } from "../../middlewares/upload";

const router = express.Router();

router.get("/", fetchSettings);
// router.post("/", saveSettings);
router.post(
  "/",
  upload.fields([
    { name: "businessLogo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "aadharPhoto", maxCount: 1 },
    { name: "panPhoto", maxCount: 1 }
  ]),
  saveSettings
);
// router.put("/", updateSettingsController);
router.put(
  "/",
  upload.fields([
    { name: "businessLogo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "aadharPhoto", maxCount: 1 },
    { name: "panPhoto", maxCount: 1 }
  ]),
  updateSettingsController
);
router.post("/clear-uploads", clearUploads);

export default router;