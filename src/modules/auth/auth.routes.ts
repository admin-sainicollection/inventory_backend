import { Router } from "express";
import * as Controller from "./auth.controller";
import { protect, authorizePermission, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerUserSchema } from "../users/user.validation";
import { forgotPasswordSchema, inviteUserSchema, loginSchema, refreshTokenSchema, resetPasswordSchema } from "./auth.validation";

const router = Router();

// Public
router.post("/auth/register", validate(registerUserSchema), Controller.register);
router.get("/auth/verify-email", Controller.verifyEmail);
router.post("/auth/login", validate(loginSchema), Controller.login);
router.post("/auth/refresh", validate(refreshTokenSchema), Controller.refresh);
router.post("/auth/forgot-password", validate(forgotPasswordSchema), Controller.forgotPassword);
router.post("/auth/reset-password", validate(resetPasswordSchema), Controller.resetPassword);
router.put("/auth/change-password/:id", protect, Controller.changePasswordController);
router.get("/auth/validate-reset-token", Controller.validateResetToken);

router.post("/admin/reset-password/:userId", protect, restrictToRoles('admin'), Controller.adminResetUserPassword);

// Protected admin invite (requires "user:create" permission)
router.post("/invite", protect, authorizePermission("user:create"), validate(inviteUserSchema), Controller.inviteUser);

// Example: admin-only route using role name
router.get("/only-admin", protect, restrictToRoles("admin"), (req, res) => res.json({ ok: true }));

router.get("/auth/get-all-users", protect, authorizePermission('user:list'), Controller.getAllUsersController)
router.get("/auth/get-single-user/:id", protect, authorizePermission('user:read'), Controller.getUserByIdController)
router.put("/auth/update-user/:id", protect, authorizePermission('user:update'), Controller.updateUserController)
router.delete("/auth/delete-user/:id", protect, restrictToRoles("admin"), Controller.deleteUserController)

// --------------------------------------------------------------------------------------------------ROLES
router.get("/role/get-all-roles", protect, authorizePermission('role:list'), Controller.getAllRolesController)
router.get("/role/get-single-role/:id", protect, authorizePermission('role:read'), Controller.getRoleByIdController)
router.post("/role/create-role", protect, authorizePermission('role:create'), Controller.createRoleController)
router.put("/role/update-role/:id", protect, authorizePermission('role:update'), Controller.updateRoleController)
router.delete("/role/delete-role/:id", protect, restrictToRoles("admin"), Controller.deleteRoleController)


export default router;
