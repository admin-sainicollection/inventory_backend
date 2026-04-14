import express from "express";
import { saveSettings, fetchSettings, updateSettingsController, clearUploads, fetchBusinessInfo, fetchTaxInfo, fetchBankInfo, fetchSignature } from "./settings.controller";
import { upload } from "../../middlewares/upload.middleware";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "businessLogo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panPhoto", maxCount: 1 }
])

router.get("/getSetting", fetchSettings);
router.get("/setting/businessInfo", fetchBusinessInfo);
router.get("/setting/taxInfo", fetchTaxInfo);
router.get("/setting/bankInfo", fetchBankInfo);
router.get("/setting/signature", fetchSignature);
// router.post("/", saveSettings);
router.post(
  "/addSetting",
  uploadFields,
  saveSettings
);
// router.put("/", updateSettingsController);
router.put(
  "/updateSetting",
  uploadFields,
  updateSettingsController
);
router.post("/clear-uploads", clearUploads);

export default router;