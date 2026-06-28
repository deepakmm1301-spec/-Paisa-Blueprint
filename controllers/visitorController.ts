import { Request, Response, NextFunction } from "express";
import { visitorModel } from "../models/visitorModel";
import { logger } from "../utils/logger";

export const visitorController = {
  getVisitors: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const count = visitorModel.getVisitorCount();
      res.json({ count });
    } catch (err) {
      next(err);
    }
  },

  hitVisitor: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const nextCount = visitorModel.incrementVisitorCount();
      logger.info(`Visitor hit recorded. New count: ${nextCount}`);
      res.json({ success: true, count: nextCount });
    } catch (err) {
      next(err);
    }
  }
};
