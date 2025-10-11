import { Router } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById
} from "./product.controller";

import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";

const router = Router();

// Protected routes for admin/manager
router.post("/add-product", protect, restrictToRoles("admin", "manager"), validate(createProductSchema), createProduct);
router.put("/update-product/:id", protect, restrictToRoles("admin", "manager"), validate(updateProductSchema), updateProduct);
router.delete("/delete-product/:id", protect, restrictToRoles("admin", "manager"), deleteProduct);

// Public or role-based read
router.get("/get-all-products", getAllProducts);
router.get("/get-one-product/:id", getProductById);

export default router;
