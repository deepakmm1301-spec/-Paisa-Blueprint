import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const LOCKER_FILE = path.join(process.cwd(), "financial-locker-db.json");

export interface SavedItem {
  id: string;
  title: string;
  type: string; // e.g., "salary" | "pension" | "sip" | "nps" | "tax" | "goal"
  createdAt: string;
  updatedAt: string;
  data: any;
  isFavourite: boolean;
}

export interface UserLockerData {
  userId: string;
  items: SavedItem[];
  recentlyViewedIds: string[]; // List of item IDs that were recently accessed or saved
}

export interface UserLockerResponse {
  salaryCalculations: SavedItem[];
  pensionCalculations: SavedItem[];
  sipPlans: SavedItem[];
  npsPlans: SavedItem[];
  taxCalculations: SavedItem[];
  financialGoals: SavedItem[];
  favourites: SavedItem[];
  recentlyViewed: SavedItem[];
}

// Memory cache of all lockers: key is userId
let lockerMemory: Record<string, UserLockerData> = {};

export function loadLockers(): void {
  try {
    if (fs.existsSync(LOCKER_FILE)) {
      const data = fs.readFileSync(LOCKER_FILE, "utf-8");
      lockerMemory = JSON.parse(data);
      logger.info("Financial Lockers DB loaded successfully.");
    } else {
      lockerMemory = {};
      saveLockers();
    }
  } catch (err) {
    logger.error("Error reading lockers DB, resetting to empty memory cache", err);
    lockerMemory = {};
  }
}

export function saveLockers(): void {
  try {
    fs.writeFileSync(LOCKER_FILE, JSON.stringify(lockerMemory, null, 2), "utf-8");
  } catch (err) {
    logger.error("Error writing lockers DB file", err);
  }
}

// Helper to map dynamic types to standard properties
function getLockerProperty(type: string): keyof Omit<UserLockerResponse, "favourites" | "recentlyViewed"> | null {
  const t = type.toLowerCase().replace(/_/g, "");
  if (t === "salary" || t === "salarycalculations") return "salaryCalculations";
  if (t === "pension" || t === "pensioncalculations") return "pensionCalculations";
  if (t === "sip" || t === "sipplans") return "sipPlans";
  if (t === "nps" || t === "npsplans") return "npsPlans";
  if (t === "tax" || t === "taxcalculations") return "taxCalculations";
  if (t === "goal" || t === "financialgoals" || t === "financialgoal") return "financialGoals";
  return null;
}

// Ensure user has a locker record initialized in memory
function ensureUserLocker(userId: string): UserLockerData {
  if (!lockerMemory[userId]) {
    lockerMemory[userId] = {
      userId,
      items: [],
      recentlyViewedIds: []
    };
  }
  if (!lockerMemory[userId].items) {
    lockerMemory[userId].items = [];
  }
  if (!lockerMemory[userId].recentlyViewedIds) {
    lockerMemory[userId].recentlyViewedIds = [];
  }
  return lockerMemory[userId];
}

// Track an item ID in the recently viewed list (max 10 items)
function trackRecentAccess(locker: UserLockerData, id: string): void {
  // Remove if already exists to move to top
  locker.recentlyViewedIds = locker.recentlyViewedIds.filter(itemId => itemId !== id);
  // Add to beginning of the array
  locker.recentlyViewedIds.unshift(id);
  // Cap at 10
  if (locker.recentlyViewedIds.length > 10) {
    locker.recentlyViewedIds = locker.recentlyViewedIds.slice(0, 10);
  }
}

export const financialLockerModel = {
  getLocker: (userId: string): UserLockerResponse => {
    const locker = ensureUserLocker(userId);
    
    const response: UserLockerResponse = {
      salaryCalculations: [],
      pensionCalculations: [],
      sipPlans: [],
      npsPlans: [],
      taxCalculations: [],
      financialGoals: [],
      favourites: [],
      recentlyViewed: []
    };

    // Sort items by updatedAt descending by default
    const sortedItems = [...locker.items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    sortedItems.forEach(item => {
      const prop = getLockerProperty(item.type);
      if (prop) {
        response[prop].push(item);
      }
      if (item.isFavourite) {
        response.favourites.push(item);
      }
    });

    // Populate recentlyViewed from recentlyViewedIds list
    const itemsMap = new Map(locker.items.map(item => [item.id, item]));
    const recentItems: SavedItem[] = [];
    locker.recentlyViewedIds.forEach(id => {
      const item = itemsMap.get(id);
      if (item) {
        recentItems.push(item);
      }
    });

    // If recentlyViewedIds is empty but we have items, fallback to sorting by updatedAt
    if (recentItems.length === 0 && locker.items.length > 0) {
      response.recentlyViewed = sortedItems.slice(0, 10);
    } else {
      response.recentlyViewed = recentItems;
    }

    return response;
  },

  getRecent: (userId: string): SavedItem[] => {
    const locker = ensureUserLocker(userId);
    const itemsMap = new Map(locker.items.map(item => [item.id, item]));
    const recentItems: SavedItem[] = [];
    
    locker.recentlyViewedIds.forEach(id => {
      const item = itemsMap.get(id);
      if (item) {
        recentItems.push(item);
      }
    });

    if (recentItems.length === 0 && locker.items.length > 0) {
      return [...locker.items]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);
    }

    return recentItems.slice(0, 10);
  },

  saveItem: (userId: string, title: string, type: string, data: any): SavedItem => {
    const locker = ensureUserLocker(userId);
    const now = new Date().toISOString();
    
    const newItem: SavedItem = {
      id: "item-" + Math.random().toString(36).substring(2, 15),
      title: title.trim(),
      type: type.trim(),
      createdAt: now,
      updatedAt: now,
      data,
      isFavourite: false
    };

    locker.items.push(newItem);
    trackRecentAccess(locker, newItem.id);
    saveLockers();

    return newItem;
  },

  updateItem: (userId: string, id: string, title?: string, data?: any): SavedItem | null => {
    const locker = ensureUserLocker(userId);
    const itemIndex = locker.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return null;

    const item = locker.items[itemIndex];
    if (title !== undefined) {
      item.title = title.trim();
    }
    if (data !== undefined) {
      item.data = data;
    }
    item.updatedAt = new Date().toISOString();

    trackRecentAccess(locker, id);
    saveLockers();

    return item;
  },

  deleteItem: (userId: string, id: string): boolean => {
    const locker = ensureUserLocker(userId);
    const itemIndex = locker.items.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    locker.items.splice(itemIndex, 1);
    locker.recentlyViewedIds = locker.recentlyViewedIds.filter(itemId => itemId !== id);
    saveLockers();

    return true;
  },

  toggleFavourite: (userId: string, id: string): SavedItem | null => {
    const locker = ensureUserLocker(userId);
    const item = locker.items.find(item => item.id === id);
    if (!item) return null;

    item.isFavourite = !item.isFavourite;
    item.updatedAt = new Date().toISOString();
    trackRecentAccess(locker, id);
    saveLockers();

    return item;
  },

  getFavourites: (userId: string): SavedItem[] => {
    const locker = ensureUserLocker(userId);
    return locker.items
      .filter(item => item.isFavourite)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  searchItems: (userId: string, query: string): SavedItem[] => {
    const locker = ensureUserLocker(userId);
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...locker.items].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    return locker.items
      .filter(item => item.title.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
};

// Auto-initialize DB on module import
loadLockers();
