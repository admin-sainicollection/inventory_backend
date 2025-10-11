import { Router } from "express";
import * as Controller from "./auth.controller";
import { protect, authorizePermission, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerUserSchema } from "../users/user.validation";
import { forgotPasswordSchema, inviteUserSchema, loginSchema, refreshTokenSchema, resetPasswordSchema, verifyEmailSchema } from "./auth.validation";

const router = Router();

// Public
router.post("/auth/register",validate(registerUserSchema), Controller.register);
router.get("/auth/verify-email", validate(verifyEmailSchema), Controller.verifyEmail);
router.post("/auth/login",validate(loginSchema), Controller.login);
router.post("/auth/refresh",validate(refreshTokenSchema), Controller.refresh);
router.post("/auth/forgot-password",validate(forgotPasswordSchema), Controller.forgotPassword);
router.post("/auth/reset-password",validate(resetPasswordSchema), Controller.resetPassword);

// Protected admin invite (requires "user:create" permission)
router.post("/invite", protect, authorizePermission("user:create"), validate(inviteUserSchema), Controller.inviteUser);

// Example: admin-only route using role name
router.get("/only-admin", protect, restrictToRoles("admin"), (req, res) => res.json({ ok: true }));

export default router;
