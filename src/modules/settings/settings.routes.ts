import express from "express";
import { saveSettings, fetchSettings, updateSettingsController, clearUploads, fetchBusinessInfo, fetchTaxInfo, fetchBankInfo, fetchSignature } from "./settings.controller";
import { upload } from "../../middlewares/upload";

const router = express.Router();

router.get("/getSetting", fetchSettings);
router.get("/setting/businessInfo", fetchBusinessInfo);
router.get("/setting/taxInfo", fetchTaxInfo);
router.get("/setting/bankInfo", fetchBankInfo);
router.get("/setting/signature", fetchSignature);
// router.post("/", saveSettings);
router.post(
  "/addSetting",
  upload.fields([
    { name: "businessLogo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panPhoto", maxCount: 1 }
  ]),
  saveSettings
);
// router.put("/", updateSettingsController);
router.put(
  "/updateSetting",
  upload.fields([
    { name: "businessLogo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panPhoto", maxCount: 1 }
  ]),
  updateSettingsController
);
router.post("/clear-uploads", clearUploads);

export default router;