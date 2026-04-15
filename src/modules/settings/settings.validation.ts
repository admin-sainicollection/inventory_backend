import { NextFunction, Request, Response } from "express";

export const validateSettings = (req: Request,
  res: Response,
  next: NextFunction) => {
  if (!req.body.businessName) {
    return res.status(400).json({ message: "Business name required" });
  }
  next();
};