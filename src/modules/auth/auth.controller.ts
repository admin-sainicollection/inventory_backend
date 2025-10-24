import { Request, Response } from "express";
import * as Service from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await Service.registerUser(req.body);
    res.status(201).json({status:"success", message: "User created. Verify email.", user: { id: user._id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, id } = req.query as any;
    await Service.verifyEmail(id, token);
    res.json({ message: "Email verified" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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
    await Service.forgotPassword(req.body.email);
    res.json({ message: "If account exists, reset instructions sent" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id, token, newPassword } = req.body;
    await Service.resetPassword(id, token, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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
