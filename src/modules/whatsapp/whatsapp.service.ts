import axios from "axios";
import { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } from "../../utils";
import { WhatsAppSession } from "./whatsAppSession.model";
import { WhatsAppMessage } from "./whatsAppMessage.model";
import { Enquiry } from "../enquiry/enquiry.model";
import { generateNextEnquiryNumber } from "../enquiry/enquiry.service";


// START BUTTON
export const sendStartButton = async (to: string) => {

    await axios.post(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Click START to begin enquiry"
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "START_ENQUIRY",
                                title: "START"
                            }
                        }
                    ]
                }
            }
        },
        {
            headers: {
                Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
};


// STOP BUTTON
export const sendStopButton = async (to: string) => {

    await axios.post(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Send your enquiry message. Click STOP when finished."
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "STOP_ENQUIRY",
                                title: "STOP"
                            }
                        }
                    ]
                }
            }
        },
        {
            headers: {
                Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );
};


// CLOSE ENQUIRY
export const closeEnquiry = async (phone: string) => {

    const session = await WhatsAppSession.findOne({
        phone,
        isActive: true
    });

    if (!session) return;

    const messages = await WhatsAppMessage.find({
        sessionId: session._id,
        direction: "IN"
    }).sort({ timestamp: 1 });

    const combinedText = messages.map(m => m.message).join("\n");

    const enquiry_no = await generateNextEnquiryNumber();

    await Enquiry.create({
        enquiry_no,
        enquiry_date: session.startedAt,
        subject: `WhatsApp Enquiry - ${phone}`,
        description: combinedText,
        source: "WHATSAPP",
        status: "NEW"
    });

    session.isActive = false;
    session.lastMessageAt = new Date();

    await session.save();
};


// AUTO CLOSE JOB
export const startAutoCloseJob = () => {

    setInterval(async () => {

        const sessions = await WhatsAppSession.find({ isActive: true });

        const now = Date.now();

        for (const session of sessions) {

            if (
                session.lastMessageAt &&
                now - session.lastMessageAt.getTime() > 60 * 60 * 1000
            ) {
                await closeEnquiry(session.phone);
            }
        }

    }, 5 * 60 * 1000);
};