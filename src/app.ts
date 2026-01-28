
import express, { Response, Request } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/inventory/category/category.routes";
import compatibilityRoutes from "./modules/inventory/compatibility/compatibility.routes";
import productRoutes from "./modules/inventory/product/product.routes";
import vendorRoutes from "./modules/vendor/vendor.routes"
import brandRoutes from "./modules/brand/brand.routes"
import priceCodeRoutes from "./modules/priceCode/priceCode.routes"
import priceListRoutes from "./modules/priceList/priceList.routes"
import partyRoutes from "./modules/party/party.routes"
import dailyLedgerRoutes from "./modules/dailyLedger/dailyLedger.routes"
import vendorDailyLedgerRoutes from "./modules/vendorDailyLedger/vendorDailyLedger.routes"
import employeeRoutes from "./modules/employee/employee.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import enquiryRoutes from "./modules/enquiry/enquiry.routes";
import invoiceRoutes from "./modules/sales/salesInvoice/salesInvoice.routes"

import dotenv from "dotenv";
import { swaggerSpecs, swaggerUi } from "./docs/swagger";
import path from "path";
dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
// app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/inventory/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

// rate limiter (tweak for production)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 }));

// routes
app.get("/", (req: Request, res: Response) => {
    res.send("Hey Frontend, It's a Backend server of Inventory. Do you want something from me?")
})

app.use("/api/v1/inventory", authRoutes);
app.use("/api/v1/inventory", categoryRoutes)
app.use("/api/v1/inventory", compatibilityRoutes)
app.use('/api/v1/inventory', productRoutes)
app.use('/api/v1/inventory', vendorRoutes)
app.use('/api/v1/inventory', brandRoutes)
app.use('/api/v1/inventory', priceCodeRoutes)
app.use('/api/v1/inventory', priceListRoutes)
app.use('/api/v1/inventory', partyRoutes)
app.use('/api/v1/inventory', dailyLedgerRoutes)
app.use('/api/v1/inventory', employeeRoutes)
app.use('/api/v1/inventory', attendanceRoutes)
app.use('/api/v1/inventory', vendorDailyLedgerRoutes)
app.use('/api/v1/inventory', enquiryRoutes)
app.use('/api/v1/inventory', invoiceRoutes)

// health
app.get("/health", (_, res) => res.json({ status: "ok" }));


export default app;