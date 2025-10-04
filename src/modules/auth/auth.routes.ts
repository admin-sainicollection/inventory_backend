import { Router } from "express";
import * as Controller from "./auth.controller";
import { protect, authorizePermission, restrictToRoles } from "../../middlewares/auth.middleware";

const router = Router();

// Public
router.post("/register", Controller.register);
router.get("/verify-email", Controller.verifyEmail);
router.post("/login", Controller.login);
router.post("/refresh", Controller.refresh);
router.post("/forgot-password", Controller.forgotPassword);
router.post("/reset-password", Controller.resetPassword);

// Protected admin invite (requires "user:create" permission)
router.post("/invite", protect, authorizePermission("user:create"), Controller.inviteUser);

// Example: admin-only route using role name
router.get("/only-admin", protect, restrictToRoles("admin"), (req, res) => res.json({ ok: true }));

export default router;
