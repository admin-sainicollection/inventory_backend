import { Router } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById
} from "./product.controller";

import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

// Protected routes for admin/manager
router.post("/product/add-product", upload.array("productImages") ,protect, authorizePermission('inventory:create'), createProduct);
router.put("/product/update-product/:id", upload.array("productImages") ,protect, authorizePermission('inventory:update'), updateProduct);
router.delete("/product/delete-product/:id", protect, restrictToRoles("admin"), deleteProduct);

// Public or role-based read
router.get("/product/get-all-products",protect, authorizePermission('inventory:list'), getAllProducts);
router.get("/product/get-one-product/:id",protect, authorizePermission('inventory:read'), getProductById);

export default router;
