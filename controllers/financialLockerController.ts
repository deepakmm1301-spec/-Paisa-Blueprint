import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { financialLockerModel } from "../models/financialLockerModel";
import { logger } from "../utils/logger";

export const financialLockerController = {
  getLocker: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const locker = financialLockerModel.getLocker(req.user.id);
      res.status(200).json(locker);
    } catch (err) {
      logger.error("Error fetching financial locker", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve locker data." });
    }
  },

  getRecent: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const recentItems = financialLockerModel.getRecent(req.user.id);
      res.status(200).json(recentItems);
    } catch (err) {
      logger.error("Error fetching recent calculations", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve recent items." });
    }
  },

  saveItem: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const { title, type, data } = req.body;

      if (!title || typeof title !== "string" || !title.trim()) {
        res.status(422).json({ error: "Unprocessable Entity", message: "A valid title is required." });
        return;
      }

      if (!type || typeof type !== "string" || !type.trim()) {
        res.status(422).json({ error: "Unprocessable Entity", message: "A valid type is required." });
        return;
      }

      if (!data || typeof data !== "object") {
        res.status(422).json({ error: "Unprocessable Entity", message: "Valid calculations data object is required." });
        return;
      }

      const newItem = financialLockerModel.saveItem(req.user.id, title, type, data);
      res.status(201).json(newItem);
    } catch (err) {
      logger.error("Error saving calculation item", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to save calculation." });
    }
  },

  updateItem: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const { id } = req.params;
      const { title, data } = req.body;

      if (!id) {
        res.status(422).json({ error: "Unprocessable Entity", message: "Item ID parameter is required." });
        return;
      }

      if (title !== undefined && (typeof title !== "string" || !title.trim())) {
        res.status(422).json({ error: "Unprocessable Entity", message: "If specified, title must be a non-empty string." });
        return;
      }

      if (data !== undefined && (typeof data !== "object" || data === null)) {
        res.status(422).json({ error: "Unprocessable Entity", message: "If specified, data must be a valid object." });
        return;
      }

      const updatedItem = financialLockerModel.updateItem(req.user.id, id, title, data);
      if (!updatedItem) {
        res.status(404).json({ error: "Not Found", message: "Locker item not found or does not belong to you." });
        return;
      }

      res.status(200).json(updatedItem);
    } catch (err) {
      logger.error("Error updating calculation item", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to update calculation." });
    }
  },

  deleteItem: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(422).json({ error: "Unprocessable Entity", message: "Item ID parameter is required." });
        return;
      }

      const success = financialLockerModel.deleteItem(req.user.id, id);
      if (!success) {
        res.status(404).json({ error: "Not Found", message: "Locker item not found or does not belong to you." });
        return;
      }

      res.status(200).json({ success: true, message: "Locker item deleted successfully." });
    } catch (err) {
      logger.error("Error deleting calculation item", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to delete item." });
    }
  },

  toggleFavourite: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(422).json({ error: "Unprocessable Entity", message: "Item ID parameter is required." });
        return;
      }

      const updatedItem = financialLockerModel.toggleFavourite(req.user.id, id);
      if (!updatedItem) {
        res.status(404).json({ error: "Not Found", message: "Locker item not found or does not belong to you." });
        return;
      }

      res.status(200).json(updatedItem);
    } catch (err) {
      logger.error("Error toggling item favourite state", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to toggle favourite state." });
    }
  },

  getFavourites: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const favourites = financialLockerModel.getFavourites(req.user.id);
      res.status(200).json(favourites);
    } catch (err) {
      logger.error("Error fetching favourite items", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve favourites." });
    }
  },

  searchItems: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized", message: "Sign-in required to access your locker." });
        return;
      }

      const query = (req.query.q as string) || "";
      const results = financialLockerModel.searchItems(req.user.id, query);
      res.status(200).json(results);
    } catch (err) {
      logger.error("Error searching locker items", err);
      res.status(500).json({ error: "Internal Server Error", message: "Failed to search locker items." });
    }
  }
};
