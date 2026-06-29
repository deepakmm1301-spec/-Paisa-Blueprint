import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { accountModel, ServerUserAccount } from "../models/accountModel";
import { logger } from "../utils/logger";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/authHelper";
import { emailService } from "../services/emailService";
import { AuthRequest } from "../middleware/auth";

export const authController = {
  // 1. REGISTER NEW USER
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, phone, name, password, defaultProfile } = req.body;

      if (!name || name.trim() === "") {
        res.status(400).json({ error: "Validation Error", message: "Full Name is required." });
        return;
      }

      if (!password || password.length < 5) {
        res.status(400).json({
          error: "Validation Error",
          message: "Password is required and must be at least 5 characters."
        });
        return;
      }

      const normalizedEmail = email ? email.trim().toLowerCase() : "";
      const normalizedPhone = phone ? phone.trim().replace(/\D/g, "") : "";

      if (!normalizedEmail && !normalizedPhone) {
        res.status(400).json({
          error: "Validation Error",
          message: "Either email or phone number is required for registration."
        });
        return;
      }

      // Check if email already exists
      if (normalizedEmail) {
        const existingEmail = accountModel.findByEmail(normalizedEmail);
        if (existingEmail) {
          res.status(400).json({
            error: "User Exists",
            message: "An account with this email is already registered."
          });
          return;
        }
      }

      // Check if phone already exists
      if (normalizedPhone) {
        const existingPhone = accountModel.getAccountsMemory().find(
          acc => acc.phone && acc.phone.replace(/\D/g, "") === normalizedPhone
        );
        if (existingPhone) {
          res.status(400).json({
            error: "User Exists",
            message: "An account with this phone number is already registered."
          });
          return;
        }
      }

      // Hash password securely via bcrypt
      const hashedPassword = await hashPassword(password);

      // Create random token for email verification
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const userId = "user-" + crypto.randomBytes(6).toString("hex");

      // Set up default profiles List matching the existing layout
      const profilesList = defaultProfile ? [
        { ...defaultProfile, id: "profile-main", name: name.trim() }
      ] : [
        {
          id: "profile-main",
          name: name.trim(),
          age: 30,
          salary: 75000,
          monthlyExpenses: 30000,
          investments: {
            epfMonthly: 5000,
            ppfAnnual: 50000,
            npsMonthly: 3000,
            elssAnnual: 25000,
            healthPremium: 15000,
            rentMonthly: 15000,
            homeLoanInterestAnnual: 0,
            otherDeductions: 0,
            directEquitySIP: 10000,
            goldMonthly: 2000
          },
          dependentsCount: 2,
          cityTier: "Metropolitan",
          insurance: {
            termCover: 5000000,
            healthCover: 500000
          }
        }
      ];

      const newAccount: ServerUserAccount = {
        id: userId,
        email: normalizedEmail || `${normalizedPhone}@paisa.in`,
        phone: normalizedPhone,
        name: name.trim(),
        fullName: name.trim(),
        passwordHash: hashedPassword,
        emailVerified: normalizedEmail ? false : true, // Auto-verify if registering with only phone
        profilePhoto: "",
        country: "India",
        state: "Delhi",
        occupation: "Salaried Professional",
        salary: defaultProfile?.salary || 75000,
        role: "user",
        subscription: "free",
        profilesList,
        activeProfileId: "profile-main",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginHistory: [{
          timestamp: new Date().toISOString(),
          ip: req.ip || "127.0.0.1",
          device: req.headers["user-agent"] || "Unknown"
        }],
        notificationPreferences: {
          email: true,
          push: true,
          monthlyNewsletter: true
        },
        verificationToken,
        refreshTokens: []
      };

      // Generate Access & Refresh tokens
      const accessToken = generateAccessToken({
        id: newAccount.id,
        email: newAccount.email,
        role: newAccount.role
      });
      const refreshToken = generateRefreshToken({
        id: newAccount.id,
        email: newAccount.email
      }, false);

      newAccount.refreshTokens?.push(refreshToken);

      // Save to ledger database
      accountModel.createAccount(newAccount);
      logger.info(`[AUDIT] After registration, stored passwordHash prefix for ${newAccount.email}: ${newAccount.passwordHash ? newAccount.passwordHash.substring(0, 15) : "undefined"}`);

      // Send Verification emails in background asynchronously to prevent registration lag
      if (normalizedEmail) {
        emailService.sendWelcome(normalizedEmail, name.trim()).catch(err => logger.error("Welcome email failed", err));
        emailService.sendVerification(normalizedEmail, name.trim(), verificationToken).catch(err => logger.error("Verification email failed", err));
      }

      // Set JWT cookies securely
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: "Account created and auto-authenticated successfully.",
        accessToken,
        user: {
          id: newAccount.id,
          email: newAccount.email,
          fullName: newAccount.fullName,
          name: newAccount.name,
          phone: newAccount.phone,
          emailVerified: newAccount.emailVerified,
          role: newAccount.role,
          subscription: newAccount.subscription,
          profilesList: newAccount.profilesList,
          activeProfileId: newAccount.activeProfileId,
          notificationPreferences: newAccount.notificationPreferences
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // 2. LOGIN USER
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Validation Error", message: "Credentials and password are required." });
        return;
      }

      const inputNorm = email.trim();
      const isEmail = inputNorm.includes("@");

      let user: ServerUserAccount | undefined;

      if (isEmail) {
        user = accountModel.findByEmail(inputNorm);
      } else {
        const digitsOnly = inputNorm.replace(/\D/g, "");
        user = accountModel.getAccountsMemory().find(
          acc => acc.phone && acc.phone.replace(/\D/g, "") === digitsOnly
        );
      }

      if (!user) {
        logger.warn(`Failed login attempt: Credential "${email}" not found.`);
        res.status(401).json({
          error: "Unauthorized",
          message: isEmail 
            ? "No account found with this email address." 
            : "No account found with this phone number."
        });
        return;
      }

      // Check password matching using bcrypt
      logger.info(`[AUDIT] Before login compare for ${user.email}, stored passwordHash prefix: ${user.passwordHash ? user.passwordHash.substring(0, 15) : "undefined"}`);
      const isMatch = await comparePassword(password, user.passwordHash);
      logger.info(`[AUDIT] Login compare result for ${user.email}: ${isMatch}`);
      if (!isMatch) {
        logger.warn(`Failed login attempt for user: ${user.email} (incorrect password).`);
        res.status(401).json({
          error: "Unauthorized",
          message: "Incorrect password or passcode PIN."
        });
        return;
      }

      // Update login indicators
      user.lastLogin = new Date().toISOString();
      if (!user.loginHistory) user.loginHistory = [];
      user.loginHistory.push({
        timestamp: new Date().toISOString(),
        ip: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Unknown"
      });

      // Maintain security footprint by keeping history capped under 5 entries
      if (user.loginHistory.length > 5) {
        user.loginHistory.shift();
      }

      // Generate credentials
      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email
      }, !!rememberMe);

      if (!user.refreshTokens) user.refreshTokens = [];
      user.refreshTokens.push(refreshToken);

      accountModel.updateAccount(user);

      // Cookie expiry
      const refreshMaxAge = rememberMe 
        ? 30 * 24 * 60 * 60 * 1000 // 30 days
        : 7 * 24 * 60 * 60 * 1000; // 7 days

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: refreshMaxAge
      });

      res.json({
        success: true,
        accessToken,
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role,
        subscription: user.subscription,
        profilesList: user.profilesList,
        activeProfileId: user.activeProfileId,
        notificationPreferences: user.notificationPreferences,
        country: user.country,
        state: user.state,
        occupation: user.occupation,
        salary: user.salary,
        loginHistory: user.loginHistory
      });
    } catch (err) {
      next(err);
    }
  },

  // 3. LOGOUT USER
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        // Find user containing this token and remove it to invalidate
        const user = accountModel.getAccountsMemory().find(
          acc => acc.refreshTokens && acc.refreshTokens.includes(refreshToken)
        );
        if (user) {
          logger.info(`[AUDIT] Before logout update for ${user.email}, stored passwordHash prefix: ${user.passwordHash ? user.passwordHash.substring(0, 15) : "undefined"}`);
          user.refreshTokens = user.refreshTokens?.filter(t => t !== refreshToken) || [];
          accountModel.updateAccount(user);
          logger.info(`[AUDIT] After logout update for ${user.email}, stored passwordHash prefix: ${user.passwordHash ? user.passwordHash.substring(0, 15) : "undefined"}`);
        }
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ success: true, message: "Logged out successfully from session locker." });
    } catch (err) {
      next(err);
    }
  },

  // 4. REFRESH SESSION TOKENS (Token Rotation)
  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        res.status(401).json({ error: "Unauthorized", message: "Refresh token is missing." });
        return;
      }

      const decoded = verifyRefreshToken(token);
      if (!decoded) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(401).json({ error: "Unauthorized", message: "Refresh token has expired." });
        return;
      }

      const user = accountModel.findById(decoded.id);
      if (!user || !user.refreshTokens || !user.refreshTokens.includes(token)) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(401).json({ error: "Unauthorized", message: "Session is invalid or revoked." });
        return;
      }

      // Token rotation: generate new pair
      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });
      const newRefreshToken = generateRefreshToken({
        id: user.id,
        email: user.email
      }, false);

      // Replace old refresh token
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      user.refreshTokens.push(newRefreshToken);
      accountModel.updateAccount(user);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          name: user.name,
          phone: user.phone,
          emailVerified: user.emailVerified,
          role: user.role,
          subscription: user.subscription,
          profilesList: user.profilesList,
          activeProfileId: user.activeProfileId,
          notificationPreferences: user.notificationPreferences
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // 5. GET CURRENT USER (SECURE)
  me: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
        return;
      }

      const user = accountModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User Not Found", message: "User does not exist in registry database." });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        phone: user.phone,
        emailVerified: user.emailVerified,
        role: user.role,
        subscription: user.subscription,
        profilePhoto: user.profilePhoto,
        country: user.country,
        state: user.state,
        occupation: user.occupation,
        salary: user.salary,
        profilesList: user.profilesList,
        activeProfileId: user.activeProfileId,
        notificationPreferences: user.notificationPreferences,
        loginHistory: user.loginHistory,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (err) {
      next(err);
    }
  },

  // 6. VERIFY EMAIL
  verifyEmail: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = (req.query.token || req.body.token) as string;
      if (!token) {
        res.status(400).json({ error: "Validation Error", message: "Verification token is required." });
        return;
      }

      const user = accountModel.findByVerificationToken(token);
      if (!user) {
        res.status(400).json({
          error: "Invalid Token",
          message: "The verification token is invalid, expired or already utilized."
        });
        return;
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      accountModel.updateAccount(user);

      res.json({
        success: true,
        message: "Email verified successfully! Your digital locker is now fully certified and secure."
      });
    } catch (err) {
      next(err);
    }
  },

  // 7. FORGOT PASSWORD REQUEST
  forgotPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        res.status(400).json({ error: "Validation Error", message: "A valid email is required." });
        return;
      }

      const user = accountModel.findByEmail(email);
      // Security standard: Always return 200/success to prevent email enumeration/harvesting attacks
      if (!user) {
        logger.info(`Forgot password requested for non-existent email: ${email}`);
        res.json({
          success: true,
          message: "If an account matches that email, a recovery token link has been sent."
        });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = expiry;
      accountModel.updateAccount(user);

      await emailService.sendForgotPassword(user.email, user.fullName, resetToken);

      res.json({
        success: true,
        message: "If an account matches that email, a recovery token link has been sent."
      });
    } catch (err) {
      next(err);
    }
  },

  // 8. RESET PASSWORD WITH TOKEN
  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password || password.length < 5) {
        res.status(400).json({
          error: "Validation Error",
          message: "Token and new password (min 5 characters) are required."
        });
        return;
      }

      const user = accountModel.findByResetToken(token);
      if (!user || !user.resetPasswordExpires) {
        res.status(400).json({ error: "Invalid Token", message: "Token is invalid, expired, or used." });
        return;
      }

      const isExpired = new Date() > new Date(user.resetPasswordExpires);
      if (isExpired) {
        res.status(400).json({ error: "Expired Token", message: "The recovery token has expired. Please request another." });
        return;
      }

      const hashedPassword = await hashPassword(password);
      user.passwordHash = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.refreshTokens = []; // Revoke active sessions for security on recovery reset

      accountModel.updateAccount(user);

      await emailService.sendPasswordChanged(user.email, user.fullName);

      res.json({
        success: true,
        message: "Your password has been successfully reset! You can now log in using your new credentials."
      });
    } catch (err) {
      next(err);
    }
  },

  // 9. CHANGE PASSWORD (PROTECTED)
  changePassword: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
        return;
      }

      if (!oldPassword || !newPassword || newPassword.length < 5) {
        res.status(400).json({
          error: "Validation Error",
          message: "Old password and new password (min 5 symbols) are required."
        });
        return;
      }

      const user = accountModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User Not Found", message: "No active user account matches this token." });
        return;
      }

      const isMatch = await comparePassword(oldPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: "Validation Error", message: "Your current password matched incorrectly." });
        return;
      }

      user.passwordHash = await hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();
      accountModel.updateAccount(user);

      await emailService.sendPasswordChanged(user.email, user.fullName);

      res.json({ success: true, message: "Locker password updated successfully." });
    } catch (err) {
      next(err);
    }
  },

  // 10. UPDATE USER PROFILE (PROTECTED)
  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
        return;
      }

      const user = accountModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User Not Found" });
        return;
      }

      const {
        fullName,
        phone,
        profilePhoto,
        country,
        state,
        occupation,
        salary,
        notificationPreferences,
        profilesList,
        activeProfileId
      } = req.body;

      if (fullName) {
        user.fullName = fullName;
        user.name = fullName; // sync
      }
      if (phone !== undefined) {
        user.phone = phone.trim().replace(/\D/g, "");
      }
      if (profilePhoto !== undefined) {
        user.profilePhoto = profilePhoto;
      }
      if (country !== undefined) {
        user.country = country;
      }
      if (state !== undefined) {
        user.state = state;
      }
      if (occupation !== undefined) {
        user.occupation = occupation;
      }
      if (salary !== undefined) {
        user.salary = Number(salary) || 0;
      }
      if (notificationPreferences !== undefined) {
        user.notificationPreferences = {
          ...user.notificationPreferences,
          ...notificationPreferences
        };
      }
      if (profilesList && Array.isArray(profilesList)) {
        user.profilesList = profilesList;
      }
      if (activeProfileId) {
        user.activeProfileId = activeProfileId;
      }

      // Sync updated salary and name back to the active profile in profilesList
      if (user.profilesList && Array.isArray(user.profilesList)) {
        const activeId = user.activeProfileId || "profile-main";
        user.profilesList = user.profilesList.map(p => {
          if (p.id === activeId) {
            return {
              ...p,
              name: user.fullName || p.name,
              salary: typeof user.salary === "number" ? user.salary : p.salary
            };
          }
          return p;
        });
      }

      user.updatedAt = new Date().toISOString();
      accountModel.updateAccount(user);

      res.json({
        success: true,
        message: "Profile settings updated successfully.",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          name: user.name,
          phone: user.phone,
          emailVerified: user.emailVerified,
          role: user.role,
          subscription: user.subscription,
          profilePhoto: user.profilePhoto,
          country: user.country,
          state: user.state,
          occupation: user.occupation,
          salary: user.salary,
          profilesList: user.profilesList,
          activeProfileId: user.activeProfileId,
          notificationPreferences: user.notificationPreferences,
          updatedAt: user.updatedAt
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // 11. DELETE ACCOUNT (PROTECTED)
  deleteAccount: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required." });
        return;
      }

      const user = accountModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User Not Found" });
        return;
      }

      accountModel.deleteAccount(user.id);

      // Send goodbye notification asynchronously
      emailService.sendAccountDeleted(user.email, user.fullName).catch(err => logger.error("Account deleted email error", err));

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ success: true, message: "Account deleted permanently." });
    } catch (err) {
      next(err);
    }
  },

  // 12. LEGACY GET-PROFILES ENDPOINT (BACKWARD-COMPATIBLE PRESERVATION)
  getProfiles: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const email = req.query.email as string;
      if (!email || email.trim() === "") {
        res.status(400).json({ error: "Email query parameter is required." });
        return;
      }

      const match = accountModel.findByEmail(email);
      if (match) {
        logger.info(`Legacy profiles fetched from ledger for: ${email}`);
        res.json({
          email: match.email,
          name: match.name,
          profilesList: match.profilesList,
          activeProfileId: match.activeProfileId,
          createdAt: match.createdAt
        });
      } else {
        // Create simple account on the fly as fallback
        logger.info(`[AUDIT] getProfiles did not find match for ${email}, executing legacy fallback creation with paisa hash!`);
        const tempId = "user-" + Math.random().toString(36).substring(2, 11);
        const newAccount: ServerUserAccount = {
          id: tempId,
          email: email.trim().toLowerCase(),
          name: email.split("@")[0],
          fullName: email.split("@")[0],
          passwordHash: "$2a$10$9fJ6LzZfH5N7P93Y12W1XODvQ1sT2U6iXfSg3v4fV7O/Yn.2E6SXe", // "paisa"
          emailVerified: true,
          role: "user",
          subscription: "free",
          profilesList: [
            {
              id: "profile-main",
              name: email.split("@")[0],
              age: 26,
              salary: 75000,
              monthlyExpenses: 30000,
              investments: {
                epfMonthly: 5000,
                ppfAnnual: 50000,
                npsMonthly: 3000,
                elssAnnual: 25000,
                healthPremium: 15000,
                rentMonthly: 15000,
                homeLoanInterestAnnual: 0,
                otherDeductions: 0,
                directEquitySIP: 10000,
                goldMonthly: 2000
              },
              dependentsCount: 2,
              cityTier: "Metropolitan",
              insurance: {
                termCover: 5000000,
                healthCover: 500000
              }
            }
          ],
          activeProfileId: "profile-main",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        accountModel.createAccount(newAccount);
        res.json({
          email: newAccount.email,
          name: newAccount.name,
          profilesList: newAccount.profilesList,
          activeProfileId: newAccount.activeProfileId,
          createdAt: newAccount.createdAt
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // 13. LEGACY UPDATE-PROFILES ENDPOINT (BACKWARD-COMPATIBLE PRESERVATION)
  updateProfiles: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { email, profilesList, activeProfileId } = req.body;
      if (!email || !Array.isArray(profilesList)) {
        res.status(400).json({ error: "Email and profilesList array are required." });
        return;
      }

      const success = accountModel.updateProfiles(email, profilesList, activeProfileId);
      if (success) {
        res.json({ success: true, message: "Profiles synchronized successfully." });
      } else {
        logger.info(`[AUDIT] updateProfiles did not find match for ${email}, executing legacy fallback creation with paisa hash!`);
        const tempId = "user-" + Math.random().toString(36).substring(2, 11);
        const newAccount: ServerUserAccount = {
          id: tempId,
          email: email.trim().toLowerCase(),
          name: email.split("@")[0],
          fullName: email.split("@")[0],
          passwordHash: "$2a$10$9fJ6LzZfH5N7P93Y12W1XODvQ1sT2U6iXfSg3v4fV7O/Yn.2E6SXe", // "paisa"
          emailVerified: true,
          role: "user",
          subscription: "free",
          profilesList,
          activeProfileId: activeProfileId || "profile-main",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        accountModel.createAccount(newAccount);
        res.json({ success: true, message: "Profiles synchronized successfully." });
      }
    } catch (err) {
      next(err);
    }
  },

  // 14. LEGACY UPDATE-ACCOUNT-NAME ENDPOINT (BACKWARD-COMPATIBLE PRESERVATION)
  updateAccountName: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { email, name } = req.body;
      if (!email || !name) {
        res.status(400).json({ error: "Email and updated Name are required." });
        return;
      }

      const success = accountModel.updateName(email, name);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Account not found in ledger" });
      }
    } catch (err) {
      next(err);
    }
  }
};
