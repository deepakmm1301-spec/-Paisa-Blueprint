import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const VISITORS_FILE = path.join(process.cwd(), "visitors-db.json");

export const visitorModel = {
  getVisitorCount: (): number => {
    try {
      if (fs.existsSync(VISITORS_FILE)) {
        const data = fs.readFileSync(VISITORS_FILE, "utf-8");
        const parsed = JSON.parse(data);
        return typeof parsed.count === "number" ? parsed.count : 1420;
      } else {
        fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count: 1420 }), "utf-8");
        return 1420;
      }
    } catch (err) {
      logger.error("Error reading visitors file:", err);
      return 1420;
    }
  },

  incrementVisitorCount: (): number => {
    try {
      const current = visitorModel.getVisitorCount();
      const nextVal = current + 1;
      fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count: nextVal }), "utf-8");
      return nextVal;
    } catch (err) {
      logger.error("Error writing visitors file:", err);
      return 1421;
    }
  }
};
