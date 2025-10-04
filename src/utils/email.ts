import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, EMAIL_FROM } from "./env";

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
} as SMTPTransport.Options);   // ✅ cast to SMTPTransport options

export const sendMail = async (to: string, subject: string, html: string) => {
    transporter;
    const info = await transporter.sendMail({
        from: EMAIL_FROM || `NoReply <${SMTP_USER}>`,
        to,
        subject,
        html,
    });
    return info;
};
