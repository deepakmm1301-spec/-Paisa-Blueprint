import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/authHelper";
import { accountModel } from "../models/accountModel";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin" | "premium";
    subscription: "free" | "premium";
  };
}

/**
 * Middleware to check if the user is authenticated via JWT.
 * It reads the token from the "accessToken" HttpOnly cookie or "Authorization" header.
 */
export function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction): void {
  let token = "";

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Check cookie if header is not present
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    logger.warn(`Unauthenticated access attempt to: ${req.originalUrl}`);
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication is required to access this resource."
    });
    return;
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    logger.warn(`Invalid or expired access token presented at: ${req.originalUrl}`);
    res.status(401).json({
      error: "Unauthorized",
      message: "Session expired or invalid token. Please log in again."
    });
    return;
  }

  // Find user in ledger db to ensure they still exist and are active
  const user = accountModel.findById(decoded.id);
  if (!user) {
    logger.warn(`User matching token not found in database: ${decoded.id}`);
    res.status(401).json({
      error: "Unauthorized",
      message: "The account associated with this session no longer exists."
    });
    return;
  }

  // Attach safe user profile markers to request object
  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    subscription: user.subscription
  };

  next();
}

/**
 * Middleware to restrict access to Admins only
 */
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
    return;
  }

  if (req.user.role !== "admin") {
    logger.warn(`Unauthorized Admin resource access attempt by ${req.user.email}`);
    res.status(430).json({
      error: "Forbidden",
      message: "Access denied. Administrative permissions are required."
    });
    return;
  }

  next();
}

/**
 * Middleware to restrict access to Premium or Admin users
 */
export function isPremium(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
    return;
  }

  const allowed = req.user.role === "admin" || req.user.role === "premium" || req.user.subscription === "premium";
  if (!allowed) {
    logger.warn(`Unauthorized Premium resource access attempt by ${req.user.email}`);
    res.status(431).json({
      error: "Forbidden",
      message: "Access denied. Premium subscription is required to unlock this feature."
    });
    return;
  }

  next();
}
