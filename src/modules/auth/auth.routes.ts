import { Router } from "express";
import * as Controller from "./auth.controller";
import { protect, authorizePermission, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerUserSchema } from "../users/user.validation";
import { forgotPasswordSchema, inviteUserSchema, loginSchema, refreshTokenSchema, resetPasswordSchema } from "./auth.validation";

const router = Router();

// Public
router.post("/auth/register", validate(registerUserSchema), Controller.register);
router.get("/auth/reset-password", Controller.getResetPasswordPage);
router.get("/auth/verify-email", Controller.verifyEmail);
router.post("/auth/login", validate(loginSchema), Controller.login);
router.post("/auth/refresh", validate(refreshTokenSchema), Controller.refresh);
router.post("/auth/forgot-password", validate(forgotPasswordSchema), Controller.forgotPassword);
router.post("/auth/reset-password", validate(resetPasswordSchema), Controller.resetPassword);
router.put("/auth/change-password/:id",  Controller.changePasswordController);
router.get("/auth/validate-reset-token", Controller.validateResetToken);

// Protected admin invite (requires "user:create" permission)
router.post("/invite", protect, authorizePermission("user:create"), validate(inviteUserSchema), Controller.inviteUser);

// Example: admin-only route using role name
router.get("/only-admin", protect, restrictToRoles("admin"), (req, res) => res.json({ ok: true }));

router.get("/auth/get-all-users", protect, restrictToRoles("admin"), Controller.getAllUsersController)
router.get("/auth/get-single-user/:id", protect, Controller.getUserByIdController)
router.put("/auth/update-user/:id", protect, Controller.updateUserController)
router.delete("/auth/delete-user/:id", protect, restrictToRoles("admin"), Controller.deleteUserController)

// --------------------------------------------------------------------------------------------------ROLES
router.get("/role/get-all-roles", protect, restrictToRoles("admin"), Controller.getAllRolesController)
router.get("/role/get-single-role/:id", protect, Controller.getRoleByIdController)
router.post("/role/create-role", protect, restrictToRoles("admin"), Controller.createRoleController)
router.put("/role/update-role/:id", protect, restrictToRoles("admin"), Controller.updateRoleController)
router.delete("/role/delete-role/:id", protect, restrictToRoles("admin"), Controller.deleteRoleController)


export default router;
