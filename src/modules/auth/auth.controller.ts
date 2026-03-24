import { Request, Response } from "express";
import * as Service from "./auth.service";
import Token from "./token.model";
import {findTokenDoc} from '../../utils/token'

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

export const getResetPasswordPage = async (req: Request, res: Response) => {
  try {
      const { token, id } = req.query;
      
      // Validate token and id
      if (!token || !id) {
          return res.status(400).send(`
              <!DOCTYPE html>
              <html>
              <head>
                  <title>Invalid Reset Link - JD-SI</title>
                  <style>
                      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                      .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); max-width: 500px; }
                      h1 { color: #f44336; margin-bottom: 20px; }
                      p { color: #666; margin-bottom: 30px; }
                      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>❌ Invalid Reset Link</h1>
                      <p>Missing token or user ID. Please request a new password reset link.</p>
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:4444'}/forgot-password" class="button">Request New Link</a>
                  </div>
              </body>
              </html>
          `);
      }
      
      // Check if token is valid
      const tokenDoc = await findTokenDoc(token as string, "passwordReset");
      
      if (!tokenDoc) {
          return res.status(400).send(`
              <!DOCTYPE html>
              <html>
              <head>
                  <title>Invalid or Expired Link - JD-SI</title>
                  <style>
                      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                      .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); max-width: 500px; }
                      h1 { color: #f44336; margin-bottom: 20px; }
                      p { color: #666; margin-bottom: 30px; }
                      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>❌ Invalid or Expired Link</h1>
                      <p>This password reset link has expired or is invalid. Please request a new one.</p>
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:4444'}/forgot-password" class="button">Request New Link</a>
                  </div>
              </body>
              </html>
          `);
      }
      
      // Verify that the token belongs to the correct user
      if (tokenDoc.userId.toString() !== id) {
          return res.status(400).send(`
              <!DOCTYPE html>
              <html>
              <head>
                  <title>Invalid Reset Link - JD-SI</title>
                  <style>
                      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                      .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); max-width: 500px; }
                      h1 { color: #f44336; margin-bottom: 20px; }
                      p { color: #666; margin-bottom: 30px; }
                      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <h1>❌ Invalid Reset Link</h1>
                      <p>This reset link is not valid for this user. Please request a new one.</p>
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:4444'}/forgot-password" class="button">Request New Link</a>
                  </div>
              </body>
              </html>
          `);
      }
      
      // Return HTML form for password reset
      res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Reset Password - JD-SI</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                  }
                  
                  body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      min-height: 100vh;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      padding: 20px;
                  }
                  
                  .container {
                      background: white;
                      border-radius: 8px;
                      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                      max-width: 450px;
                      width: 100%;
                      padding: 40px;
                  }
                  
                  h1 {
                      color: #333;
                      margin-bottom: 10px;
                      font-size: 24px;
                  }
                  
                  .subtitle {
                      color: #666;
                      margin-bottom: 30px;
                      font-size: 14px;
                  }
                  
                  .form-group {
                      margin-bottom: 20px;
                  }
                  
                  label {
                      display: block;
                      margin-bottom: 8px;
                      color: #555;
                      font-weight: 500;
                      font-size: 14px;
                  }
                  
                  input {
                      width: 100%;
                      padding: 12px;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      font-size: 14px;
                      transition: border-color 0.3s;
                  }
                  
                  input:focus {
                      outline: none;
                      border-color: #667eea;
                  }
                  
                  .password-strength {
                      margin-top: 5px;
                      font-size: 12px;
                      color: #666;
                  }
                  
                  button {
                      width: 100%;
                      padding: 12px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      border: none;
                      border-radius: 4px;
                      font-size: 16px;
                      font-weight: bold;
                      cursor: pointer;
                      transition: transform 0.2s;
                  }
                  
                  button:hover {
                      transform: translateY(-1px);
                  }
                  
                  button:active {
                      transform: translateY(0);
                  }
                  
                  button:disabled {
                      opacity: 0.6;
                      cursor: not-allowed;
                  }
                  
                  .error-message {
                      background: #ffebee;
                      color: #c62828;
                      padding: 12px;
                      border-radius: 4px;
                      margin-bottom: 20px;
                      font-size: 14px;
                      display: none;
                  }
                  
                  .success-message {
                      background: #e8f5e9;
                      color: #2e7d32;
                      padding: 12px;
                      border-radius: 4px;
                      margin-bottom: 20px;
                      font-size: 14px;
                      display: none;
                  }
                  
                  .loading {
                      display: none;
                      text-align: center;
                      margin-top: 15px;
                  }
                  
                  .spinner {
                      border: 2px solid #f3f3f3;
                      border-top: 2px solid #667eea;
                      border-radius: 50%;
                      width: 20px;
                      height: 20px;
                      animation: spin 1s linear infinite;
                      display: inline-block;
                      margin-right: 8px;
                      vertical-align: middle;
                  }
                  
                  @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Set New Password</h1>
                  <p class="subtitle">Please enter your new password below</p>
                  
                  <div id="errorMessage" class="error-message"></div>
                  <div id="successMessage" class="success-message"></div>
                  
                  <div>
                      <div class="form-group">
                          <label for="newPassword">New Password</label>
                          <input type="password" id="newPassword" required>
                          <div class="password-strength" id="passwordStrength"></div>
                      </div>
                      
                      <div class="form-group">
                          <label for="confirmPassword">Confirm Password</label>
                          <input type="password" id="confirmPassword" required>
                      </div>
                      
                      <button id="resetBtn">Reset Password</button>
                      <div id="loading" class="loading">
                          <div class="spinner"></div> Processing...
                      </div>
                  </div>
              </div>
              
              <script>
                  // Wait for DOM to load
                  document.addEventListener('DOMContentLoaded', function() {
                      const newPassword = document.getElementById('newPassword');
                      const confirmPassword = document.getElementById('confirmPassword');
                      const errorMessage = document.getElementById('errorMessage');
                      const successMessage = document.getElementById('successMessage');
                      const loading = document.getElementById('loading');
                      const resetBtn = document.getElementById('resetBtn');
                      const passwordStrength = document.getElementById('passwordStrength');
                      
                      const userId = '${id}';
                      const resetToken = '${token}';
                      
                      console.log('Page loaded with userId:', userId);
                      console.log('Reset token:', resetToken);
                      
                      // Password strength indicator
                      newPassword.addEventListener('input', function() {
                          const password = this.value;
                          let strength = '';
                          let color = '#666';
                          
                          if (password.length === 0) {
                              strength = '';
                          } else if (password.length < 6) {
                              strength = 'Weak - Minimum 6 characters';
                              color = '#f44336';
                          } else if (password.length < 8) {
                              strength = 'Medium';
                              color = '#ff9800';
                          } else {
                              strength = 'Strong';
                              color = '#4caf50';
                          }
                          
                          passwordStrength.textContent = strength;
                          passwordStrength.style.color = color;
                      });
                      
                      // Reset password function
                      async function resetPassword() {
                          // Clear previous messages
                          errorMessage.style.display = 'none';
                          successMessage.style.display = 'none';
                          
                          const password = newPassword.value;
                          const confirm = confirmPassword.value;
                          
                          // Validate
                          if (!password) {
                              errorMessage.textContent = 'Please enter a new password';
                              errorMessage.style.display = 'block';
                              newPassword.focus();
                              return;
                          }
                          
                          if (password.length < 6) {
                              errorMessage.textContent = 'Password must be at least 6 characters';
                              errorMessage.style.display = 'block';
                              newPassword.focus();
                              return;
                          }
                          
                          if (password !== confirm) {
                              errorMessage.textContent = 'Passwords do not match';
                              errorMessage.style.display = 'block';
                              confirmPassword.focus();
                              return;
                          }
                          
                          // Show loading
                          loading.style.display = 'block';
                          resetBtn.disabled = true;
                          
                          try {
                              console.log('Sending reset request...');
                              
                              const response = await fetch('/api/v1/inventory/auth/reset-password', {
                                  method: 'POST',
                                  headers: {
                                      'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                      id: userId,
                                      token: resetToken,
                                      newPassword: password
                                  })
                              });
                              
                              const data = await response.json();
                              console.log('Response:', data);
                              
                              if (response.ok && data.status === 'success') {
                                  successMessage.textContent = data.message || 'Password reset successful! Redirecting to login...';
                                  successMessage.style.display = 'block';
                                  newPassword.value = '';
                                  confirmPassword.value = '';
                                  
                                  // Redirect to login after 3 seconds
                                  setTimeout(() => {
                                      window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:4444'}/login';
                                  }, 3000);
                              } else {
                                  errorMessage.textContent = data.message || 'Failed to reset password';
                                  errorMessage.style.display = 'block';
                              }
                          } catch (error) {
                              console.error('Reset password error:', error);
                              errorMessage.textContent = error.message || 'Network error. Please try again.';
                              errorMessage.style.display = 'block';
                          } finally {
                              loading.style.display = 'none';
                              resetBtn.disabled = false;
                          }
                      }
                      
                      // Add click event listener to button
                      resetBtn.addEventListener('click', resetPassword);
                      
                      // Add enter key support
                      newPassword.addEventListener('keypress', function(e) {
                          if (e.key === 'Enter') {
                              e.preventDefault();
                              resetPassword();
                          }
                      });
                      
                      confirmPassword.addEventListener('keypress', function(e) {
                          if (e.key === 'Enter') {
                              e.preventDefault();
                              resetPassword();
                          }
                      });
                  });
              </script>
          </body>
          </html>
      `);
  } catch (err: any) {
      console.error('Error in getResetPasswordPage:', err);
      res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Error - JD-SI</title>
              <style>
                  body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                  .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); max-width: 500px; }
                  h1 { color: #f44336; margin-bottom: 20px; }
                  p { color: #666; margin-bottom: 30px; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>❌ Error</h1>
                  <p>${err.message || 'An error occurred'}</p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:4444'}/forgot-password" class="button">Request New Link</a>
              </div>
          </body>
          </html>
      `);
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