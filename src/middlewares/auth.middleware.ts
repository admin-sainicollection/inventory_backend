import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { findUserById } from "../modules/auth/auth.repository";

export interface AuthRequest extends Request {
  user?: any;
}

// protect: checks access token and attaches user with populated role
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization as string;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1] as string;
    const decoded: any = verifyAccessToken(token) ;
    if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });
    const user = await findUserById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if ((user as any).passwordChangedAt && new Date((user as any).passwordChangedAt) > new Date((decoded.iat || 0) * 1000)) {
      return res.status(401).json({ message: "Password changed. Please login again." });
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};

// authorize by permission string (e.g., "user:create" or "inventory:manage")
export const authorizePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ message: "Forbidden" });
    const permissions = (role as any).permissions || [];
    if (!permissions.includes(permission)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};

// simple role check helper (if you want role names)
export const restrictToRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const roleName = (req.user?.role as any)?.name;
    if (!roleName || !roles.includes(roleName)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};
