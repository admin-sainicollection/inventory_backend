

import express,{Response, Request} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/inventory/category/category.routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
// app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// rate limiter (tweak for production)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// routes
app.get("/",(req:Request, res:Response)=>{
    res.send("Hey Frontend, It's a Backend server of Inventory. Do you want something from me?")
})

app.use("/api/auth", authRoutes);
app.use("/api/categories",categoryRoutes)

// health
app.get("/health", (_, res) => res.json({ status: "ok" }));


export default app;