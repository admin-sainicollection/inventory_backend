import dotenv from "dotenv";

const env = process.env.APP_ENV ||  "development";

// dotenv.config({
//   path:`env.${env}`
// });

dotenv.config();

export const APP_ENV = env;
export const PORT = process.env.PORT || "9999";
export const BASE_URL_SERVER = process.env.BASE_URL_SERVER || "http://0.0.0.0:3000";
export const FRONTEND_URL = process.env.FRONTEND_URL;

export const MONGO_URL = process.env.MONGO_URL || "";

export const JWT_SECRET = process.env.JWT_SECRET ;
export const JWT_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` | number =
  (process.env.JWT_EXPIRES_IN as any) || "15m";

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` | number =
  (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || "7d";

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_USER = process.env.ADMIN_USER;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_NAME = process.env.ADMIN_NAME;

export const WHATSAPP_VERIFY_TOKEN=process.env.WHATSAPP_VERIFY_TOKEN;
export const WHATSAPP_PHONE_NUMBER_ID=process.env.WHATSAPP_PHONE_NUMBER_ID;
export const WHATSAPP_ACCOUNT_ID=process.env.WHATSAPP_ACCOUNT_ID;
export const WHATSAPP_ACCESS_TOKEN=process.env.WHATSAPP_ACCESS_TOKEN;

