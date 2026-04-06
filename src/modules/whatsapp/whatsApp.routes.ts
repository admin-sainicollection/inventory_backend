import { Router } from "express";
import { verifyWhatsappWebhook, whatsappMessageController } from "./whatsApp.controller";

const router = Router();

router.post("/webhook", whatsappMessageController);
router.get("/webhook", verifyWhatsappWebhook);

export default router;