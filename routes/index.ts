import { Router } from "express";
import { authController } from "../controllers/authController";
import { chatController } from "../controllers/chatController";
import { insightController } from "../controllers/insightController";
import { visitorController } from "../controllers/visitorController";
import { apiLimiter, heavyLimiter } from "../middleware/rateLimiter";
import { isAuthenticated, isAdmin, isPremium } from "../middleware/auth";

const router = Router();

// General API Rate Limiting applied to all routes in this sub-router
router.use(apiLimiter);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Visitor endpoints
router.get("/visitors", visitorController.getVisitors);
router.post("/visitors/hit", visitorController.hitVisitor);

// Enterprise Authentication Endpoints
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.post("/auth/refresh", authController.refresh);
router.post("/auth/verify-email", authController.verifyEmail);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);

// Protected Auth Endpoints (require authentication)
router.get("/auth/me", isAuthenticated as any, authController.me as any);
router.post("/auth/change-password", isAuthenticated as any, authController.changePassword as any);
router.put("/auth/profile", isAuthenticated as any, authController.updateProfile as any);
router.delete("/auth/profile", isAuthenticated as any, authController.deleteAccount as any);

// Legacy Authentication/Portfolio Profiles endpoints for backward-compatibility
router.get("/auth/get-profiles", authController.getProfiles);
router.post("/auth/update-profiles", authController.updateProfiles);
router.post("/auth/update-account-name", authController.updateAccountName);

// AI Advisor chat endpoints (Heavy rate limiter applied to safeguard Gemini usage)
router.post("/chat", heavyLimiter, chatController.chat);
router.get("/chat/status", chatController.getStatus);

// Market Insights endpoint
router.get("/market-insights", insightController.getMarketInsights);

export default router;
