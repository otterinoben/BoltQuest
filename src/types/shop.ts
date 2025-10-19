export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'avatar' | 'theme' | 'badge' | 'powerup' | 'feature';
  price: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'available' | 'coming_soon' | 'limited';
  unlockRequirement?: {
    level?: number;
    achievement?: string;
  };
  previewImage?: string;
  effects?: {
    duration?: number; // in hours for power-ups
    multiplier?: number;
    description?: string;
  };
}

export interface UserInventory {
  userId: string;
  items: {
    [itemId: string]: {
      purchasedAt: number;
      quantity: number;
      equipped?: boolean;
      used?: boolean;
      expiresAt?: number; // for time-limited items
    };
  };
  lastUpdated: number;
}

export interface ShopCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: ShopItem[];
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  newBalance?: number;
  item?: ShopItem;
}

export interface ShopStats {
  totalItems: number;
  availableItems: number;
  comingSoonItems: number;
  totalPurchases: number;
  totalRevenue: number; // in coins
}

