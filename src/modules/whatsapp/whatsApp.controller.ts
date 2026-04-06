import { Request, Response } from "express";
import { WhatsAppSession } from "./whatsAppSession.model";
import { sendStartButton, sendStopButton, closeEnquiry } from "./whatsapp.service";
import { WhatsAppMessage } from "./whatsAppMessage.model";
import { WHATSAPP_VERIFY_TOKEN } from "../../utils";

export const whatsappMessageController = async (req: Request, res: Response) => {

    console.log("🔥 WEBHOOK HIT");
    console.log(JSON.stringify(req.body, null, 2));

    try {

        const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) return res.sendStatus(200);

        const phone = message.from;

        // =========================
        // TEXT MESSAGE
        // =========================
        if (message.type === "text") {

            const text = message.text.body;

            const session = await WhatsAppSession.findOne({
                phone,
                isActive: true
            });

            // ❌ No active session → show START button
            if (!session) {

                console.log("No active session → sending START button");

                await sendStartButton(phone);

                return res.sendStatus(200);
            }

            // ✅ Save enquiry message
            await WhatsAppMessage.create({
                phone,
                message: text,
                direction: "IN",
                sessionId: session._id
            });

            session.lastMessageAt = new Date();
            await session.save();

            // Send STOP button after message
            await sendStopButton(phone);

            return res.sendStatus(200);
        }

        // =========================
        // BUTTON CLICK
        // =========================
        if (message.type === "interactive") {

            const buttonId = message.interactive?.button_reply?.id;

            console.log("Button clicked:", buttonId);

            // START ENQUIRY
            if (buttonId === "START_ENQUIRY") {

                // Close previous sessions (safety)
                await WhatsAppSession.updateMany(
                    { phone, isActive: true },
                    { isActive: false }
                );

                const session = await WhatsAppSession.create({
                    phone,
                    isActive: true,
                    startedAt: new Date(),
                    lastMessageAt: new Date()
                });

                console.log("Session started:", session._id);

                await sendStopButton(phone);

                return res.sendStatus(200);
            }

            // STOP ENQUIRY
            if (buttonId === "STOP_ENQUIRY") {

                console.log("Closing enquiry for:", phone);

                await closeEnquiry(phone);

                return res.sendStatus(200);
            }
        }

        return res.sendStatus(200);

    } catch (err) {

        console.error("WhatsApp Webhook Error:", err);

        return res.sendStatus(500);
    }
};

export const verifyWhatsappWebhook = async (req:Request, res:Response)=>{
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token === WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
}