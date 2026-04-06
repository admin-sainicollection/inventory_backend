import { Request, Response } from "express";
import * as Service from "./auth.service";
import { findTokenDoc } from '../../utils/token'

export const register = async (req: Request, res: Response) => {
  try {
    const user = await Service.registerUser(req.body);
    res.status(201).json({ status: "success", message: "User created. Verify email.", user: { id: user._id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, id } = req.query as any;

    // Manual validation
    if (!id || !token) {
      return res.status(400).json({
        status: "error",
        message: "User ID and verification token are required"
      });
    }

    await Service.verifyEmail(id, token);

    // Return HTML response for better user experience
    res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Email Verified - JD-SI</title>
              <style>
                  body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                  .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                  h1 { color: #4caf50; margin-bottom: 20px; }
                  p { color: #666; margin-bottom: 30px; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>✅ Email Verified Successfully!</h1>
                  <p>Your email has been verified. You will receive your login credentials shortly on email.</p>
                  <a href="${process.env.FRONTEND_URL}/login" class="button">Go to Login</a>
              </div>
          </body>
          </html>
      `);
  } catch (err: any) {
    res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Verification Failed - JD-SI</title>
              <style>
                  body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                  .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                  h1 { color: #f44336; margin-bottom: 20px; }
                  p { color: #666; margin-bottom: 30px; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>❌ Verification Failed</h1>
                  <p>${err.message}</p>
                  <a href="${process.env.FRONTEND_URL}/login" class="button">Go to Login</a>
              </div>
          </body>
          </html>
      `);
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token, id } = req.query;

    if (!token || !id) {
      return res.status(400).json({
        status: "error",
        message: "Token and user ID are required"
      });
    }

    const tokenDoc = await findTokenDoc(token as string, "passwordReset");

    if (!tokenDoc || tokenDoc.userId.toString() !== id) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token"
      });
    }

    res.json({
      status: "success",
      message: "Token is valid"
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

export const adminResetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get admin from request (set by protect middleware)
    const admin = (req as any).user;

    if (!admin) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized: Admin authentication required"
      });
      return;
    }

    // Check if user has admin role
    const roleName = admin.role?.name?.toLowerCase();
    if (roleName !== 'admin') {
      res.status(403).json({
        status: "error",
        message: "Forbidden: Only administrators can reset user passwords"
      });
      return;
    }

    const result = await Service.adminResetUserPassword(admin._id.toString(), userId as string);

    res.json({
      status: "success",
      message: result.message,
      data: {
        temporaryPassword: result.temporaryPassword // Remove in production
      }
    });
  } catch (error: any) {
    console.error("Admin reset password error:", error);
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to reset password"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier = email or username
    const data = await Service.login(identifier, password);
    // Optionally set refresh token in httpOnly cookie:
    // res.cookie("refreshToken", data.refresh, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: 'strict', maxAge: 30*24*60*60*1000 });
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refresh } = req.body; // or from cookie
    const data = await Service.refreshToken(refresh);
    res.json(data);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }

    await Service.forgotPassword(email);

    res.json({
      status: "success",
      message: "If an account exists with this email, password reset instructions have been sent."
    });
  } catch (err: any) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id, token, newPassword } = req.body;

    // Validate required fields
    if (!id || !token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "User ID, token, and new password are required"
      });
    }

    await Service.resetPassword(id, token, newPassword);

    res.json({
      status: "success",
      message: "Password reset successful. You can now login with your new password."
    });
  } catch (err: any) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
      });
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      res.status(400).json({
        status: "error",
        message: "New password must be at least 6 characters",
      });
      return;
    }

    const result = await Service.changePasswordService(id as string, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error: any) {
    console.error("Change password error:", error);

    // Handle specific error messages
    if (error.message === "User not found") {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } else if (error.message === "Current password is incorrect") {
      res.status(401).json({
        status: "error",
        message: error.message,
      });
    } else if (error.message === "New password cannot be the same as current password") {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to change password",
      });
    }
  }
};

// Admin-only invite
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const actorId = (req as any).user?._id?.toString();
    const user = await Service.adminCreateUser(actorId, req.body);
    res.status(201).json({ user: { id: user._id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;
    const role = req.query.role as string;

    const result = await Service.getAllUsersService(page, limit, search, status, role);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch users",
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await Service.getUserByIdService(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Get user by ID error:", error);

    if (error.message === "User not found" || error.message === "Invalid user ID format") {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch user",
      });
    }
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData._id;

    const result = await Service.updateUserService(id as string, updateData);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.message.includes("already in use")) {
      res.status(409).json({
        status: "error",
        message: error.message,
      });
    } else if (error.message === "User not found" || error.message === "Invalid user ID format") {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update user",
      });
    }
  }
};


export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await Service.deleteUserService(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Permanently delete user error:", error);

    if (error.message === "User not found" || error.message === "Invalid user ID format") {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to permanently delete user",
      });
    }
  }
};

// ------------------------------------------------------------------------------------------- ROLE
// get all roles
export const getAllRolesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Service.getAllRoles();

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
      count: roles.length,
    });
  } catch (error: any) {
    console.error("Error in getAllRoles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

// get single role
export const getRoleByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
      return;
    }

    const role = await Service.getRoleById(id);

    if (!role) {
      res.status(404).json({
        success: false,
        message: "Role not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error: any) {
    console.error("Error in getRoleById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch role",
      error: error.message,
    });
  }
};

// create role
export const createRoleController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, permissions, description } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: "Name are required",
      });
      return;
    }

    // Validate permissions array
    // if (!Array.isArray(permissions)) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Permissions must be an array",
    //   });
    //   return;
    // }

    const role = await Service.createRole({
      name,
      permissions,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error: any) {
    console.error("Error in createRole:", error);

    // Handle duplicate key error
    if (error.message.includes("already exists")) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create role",
      error: error.message,
    });
  }
};


export const updateRoleController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, permissions, description } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
      return;
    }

    // Validate permissions if provided
    // if (permissions !== undefined && !Array.isArray(permissions)) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Permissions must be an array",
    //   });
    //   return;
    // }

    const role = await Service.updateRole(id, {
      name,
      permissions,
      description,
    });

    if (!role) {
      res.status(404).json({
        success: false,
        message: "Role not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error: any) {
    console.error("Error in updateRole:", error);

    if (error.message.includes("already exists")) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message,
    });
  }
};


export const deleteRoleController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
      return;
    }

    const result = await Service.deleteRole(id);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
        assignedUsers: (result as any).assignedUsers, // If using deleteRoleWithDetails
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error in deleteRole:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete role",
    });
  }
};