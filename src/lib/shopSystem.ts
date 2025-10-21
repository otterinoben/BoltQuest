import { ShopItem, UserInventory, ShopCategory, PurchaseResult, ShopStats } from '@/types/shop';
import { getUserProfile, saveUserProfile } from './userStorage';
import { spendCoins, getCoinBalance } from './coinSystem';

const INVENTORY_STORAGE_KEY = 'buzzbolt_user_inventory';

// Default shop items
const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  // Avatars (Coming Soon)
  {
    id: 'avatar_mystery_pack',
    name: 'Mystery Avatar Pack',
    description: 'Unlock 5 random premium avatars',
    category: 'avatar',
    price: 500,
    icon: 'User',
    rarity: 'rare',
    status: 'coming_soon'
  },
  {
    id: 'avatar_premium_collection',
    name: 'Premium Avatar Collection',
    description: 'Access to exclusive avatar designs',
    category: 'avatar',
    price: 1000,
    icon: 'Crown',
    rarity: 'epic',
    status: 'coming_soon'
  },
  {
    id: 'avatar_legendary_set',
    name: 'Legendary Avatar Set',
    description: 'The ultimate avatar collection',
    category: 'avatar',
    price: 2500,
    icon: 'Gem',
    rarity: 'legendary',
    status: 'coming_soon'
  },

  // Titles
  {
    id: 'beta-tester-title',
    name: 'Beta Tester',
    description: 'Helped shape the future of BuzzBolt',
    category: 'title',
    price: 1000,
    icon: 'Award',
    rarity: 'epic',
    status: 'available',
    effects: {
      description: 'Shows your early support for BuzzBolt'
    }
  },
  {
    id: 'og-member-title',
    name: 'OG Member',
    description: 'One of the original BuzzBolt pioneers',
    category: 'title',
    price: 2500,
    icon: 'Crown',
    rarity: 'legendary',
    status: 'available',
    effects: {
      description: 'Exclusive title for early adopters'
    }
  },
  {
    id: 'coin-collector-title',
    name: 'Coin Collector',
    description: 'Master of the coin economy',
    category: 'title',
    price: 500,
    icon: 'Coins',
    rarity: 'rare',
    status: 'available',
    effects: {
      description: 'Shows your dedication to earning coins'
    }
  },
  {
    id: 'quiz-master-title',
    name: 'Quiz Master',
    description: 'Ultimate quiz knowledge seeker',
    category: 'title',
    price: 1500,
    icon: 'Trophy',
    rarity: 'epic',
    status: 'available',
    effects: {
      description: 'Demonstrates your quiz expertise'
    }
  },
  {
    id: 'speed-demon-title',
    name: 'Speed Demon',
    description: 'Lightning-fast answer machine',
    category: 'title',
    price: 800,
    icon: 'Zap',
    rarity: 'rare',
    status: 'available',
    effects: {
      description: 'Shows your quick thinking abilities'
    }
  },
  {
    id: 'accuracy-king-title',
    name: 'Accuracy King',
    description: 'Perfectionist extraordinaire',
    category: 'title',
    price: 1200,
    icon: 'Target',
    rarity: 'epic',
    status: 'available',
    effects: {
      description: 'Celebrates your precision and accuracy'
    }
  },
  {
    id: 'streak-champion-title',
    name: 'Streak Champion',
    description: 'Unstoppable momentum master',
    category: 'title',
    price: 600,
    icon: 'Flame',
    rarity: 'rare',
    status: 'available',
    effects: {
      description: 'Shows your consistency and dedication'
    }
  },
  {
    id: 'elite-gamer-title',
    name: 'Elite Gamer',
    description: 'Top-tier gaming excellence',
    category: 'title',
    price: 3000,
    icon: 'Gem',
    rarity: 'legendary',
    status: 'available',
    effects: {
      description: 'The ultimate gaming achievement'
    }
  },
  {
    id: 'theme_dark_pro',
    name: 'Dark Mode Pro',
    description: 'Enhanced dark theme with premium styling',
    category: 'theme',
    price: 300,
    icon: 'Moon',
    rarity: 'common',
    status: 'coming_soon'
  },
  {
    id: 'theme_neon',
    name: 'Neon Theme',
    description: 'Vibrant neon colors for night owls',
    category: 'theme',
    price: 500,
    icon: 'Sparkles',
    rarity: 'rare',
    status: 'coming_soon'
  },
  {
    id: 'theme_minimalist',
    name: 'Minimalist Theme',
    description: 'Clean, distraction-free interface',
    category: 'theme',
    price: 400,
    icon: 'Circle',
    rarity: 'common',
    status: 'coming_soon'
  },
  {
    id: 'theme_corporate',
    name: 'Corporate Theme',
    description: 'Professional theme for business users',
    category: 'theme',
    price: 600,
    icon: 'Briefcase',
    rarity: 'rare',
    status: 'coming_soon'
  },

  // Badges (Available Now)
  {
    id: 'badge_early_supporter',
    name: 'Early Supporter Badge',
    description: 'Show your early support for BuzzBolt',
    category: 'badge',
    price: 100,
    icon: 'Trophy',
    rarity: 'rare',
    status: 'available'
  },
  {
    id: 'badge_community_member',
    name: 'Community Member Badge',
    description: 'Join the BuzzBolt community',
    category: 'badge',
    price: 50,
    icon: 'Users',
    rarity: 'common',
    status: 'available'
  },
  {
    id: 'badge_social_butterfly',
    name: 'Social Butterfly Badge',
    description: 'Follow all our social platforms',
    category: 'badge',
    price: 150,
    icon: 'Heart',
    rarity: 'epic',
    status: 'available',
    unlockRequirement: {
      achievement: 'social_follow_all'
    }
  },

  // Power-ups (Coming Soon)
  {
    id: 'powerup_double_xp',
    name: 'Double XP Boost',
    description: 'Double XP for 1 hour',
    category: 'powerup',
    price: 200,
    icon: 'Zap',
    rarity: 'common',
    status: 'coming_soon',
    effects: {
      duration: 1,
      multiplier: 2,
      description: 'Double XP for 1 hour'
    }
  },
  {
    id: 'powerup_coin_multiplier',
    name: 'Coin Multiplier',
    description: 'Double coin earnings for 24 hours',
    category: 'powerup',
    price: 300,
    icon: 'Coins',
    rarity: 'rare',
    status: 'coming_soon',
    effects: {
      duration: 24,
      multiplier: 2,
      description: 'Double coin earnings for 24 hours'
    }
  },
  {
    id: 'powerup_streak_shield',
    name: 'Streak Shield',
    description: 'Protects against 1 streak loss',
    category: 'powerup',
    price: 500,
    icon: 'Shield',
    rarity: 'epic',
    status: 'coming_soon',
    effects: {
      description: 'Protects against 1 streak loss'
    }
  },

  // Features (Coming Soon)
  {
    id: 'feature_custom_categories',
    name: 'Custom Categories',
    description: 'Create your own question categories',
    category: 'feature',
    price: 1000,
    icon: 'Edit',
    rarity: 'epic',
    status: 'coming_soon'
  },
  {
    id: 'feature_advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed performance insights',
    category: 'feature',
    price: 800,
    icon: 'BarChart3',
    rarity: 'rare',
    status: 'coming_soon'
  },
  {
    id: 'feature_priority_support',
    name: 'Priority Support',
    description: 'Get help faster with priority support',
    category: 'feature',
    price: 1500,
    icon: 'Headphones',
    rarity: 'legendary',
    status: 'coming_soon'
  }
];

// Get all shop items
export const getShopItems = (): ShopItem[] => {
  return [...DEFAULT_SHOP_ITEMS];
};

// Get items by category
export const getItemsByCategory = (category: ShopItem['category']): ShopItem[] => {
  return getShopItems().filter(item => item.category === category);
};

// Get shop categories
export const getShopCategories = (): ShopCategory[] => {
  const items = getShopItems();
  
  return [
    {
      id: 'avatars',
      name: 'Avatars',
      description: 'Customize your profile appearance',
      icon: 'User',
      items: items.filter(item => item.category === 'avatar')
    },
    {
      id: 'themes',
      name: 'Themes',
      description: 'Change the look and feel of the app',
      icon: 'Palette',
      items: items.filter(item => item.category === 'theme')
    },
    {
      id: 'titles',
      name: 'Titles',
      description: 'Exclusive titles to show off your status',
      icon: 'Award',
      items: items.filter(item => item.category === 'title')
    },
    {
      id: 'powerups',
      name: 'Power-ups',
      description: 'Boost your performance',
      icon: 'Zap',
      items: items.filter(item => item.category === 'powerup')
    },
    {
      id: 'features',
      name: 'Features',
      description: 'Unlock premium functionality',
      icon: 'Settings',
      items: items.filter(item => item.category === 'feature')
    }
  ];
};

// Check if item is unlocked (meets requirements)
export const checkItemUnlocked = (item: ShopItem): boolean => {
  if (!item.unlockRequirement) return true;
  
  const profile = getUserProfile();
  if (!profile) return false;
  
  const { level, achievement } = item.unlockRequirement;
  
  if (level && (profile.level || 1) < level) return false;
  if (achievement && !(profile.achievements || []).includes(achievement)) return false;
  
  return true;
};

// Purchase an item
export const purchaseItem = (itemId: string): PurchaseResult => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      return { success: false, message: 'No user profile found' };
    }

    const item = getShopItems().find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    if (item.status !== 'available') {
      return { success: false, message: 'Item is not available for purchase' };
    }

    if (!checkItemUnlocked(item)) {
      return { success: false, message: 'Item requirements not met' };
    }

    const currentBalance = getCoinBalance();
    if (currentBalance < item.price) {
      return { success: false, message: 'Not enough coins' };
    }

    // Check if already owned
    const inventory = getUserInventory();
    if (inventory.items[itemId]) {
      return { success: false, message: 'Item already owned' };
    }

    // Spend coins
    const spendSuccess = spendCoins(item.price, `Purchased ${item.name}`, { itemId });
    if (!spendSuccess) {
      return { success: false, message: 'Failed to process payment' };
    }

    // Add to inventory
    inventory.items[itemId] = {
      purchasedAt: Date.now(),
      quantity: 1,
      equipped: false,
      used: false
    };

    // Set expiry for time-limited items
    if (item.effects?.duration) {
      inventory.items[itemId].expiresAt = Date.now() + (item.effects.duration * 60 * 60 * 1000);
    }

    saveUserInventory(inventory);

    return {
      success: true,
      message: `Successfully purchased ${item.name}!`,
      newBalance: getCoinBalance(),
      item
    };
  } catch (error) {
    console.error('Error purchasing item:', error);
    return { success: false, message: 'An error occurred during purchase' };
  }
};

// Get user inventory
export const getUserInventory = (): UserInventory => {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
  }

  // Return default inventory
  const profile = getUserProfile();
  return {
    userId: profile?.id || 'anonymous',
    items: {},
    lastUpdated: Date.now()
  };
};

// Save user inventory
export const saveUserInventory = (inventory: UserInventory): void => {
  try {
    inventory.lastUpdated = Date.now();
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  } catch (error) {
    console.error('Error saving inventory:', error);
  }
};

// Check if user owns an item
export const userOwnsItem = (itemId: string): boolean => {
  const inventory = getUserInventory();
  return !!inventory.items[itemId];
};

// Equip an item
export const equipItem = (itemId: string): boolean => {
  try {
    const inventory = getUserInventory();
    if (!inventory.items[itemId]) {
      return false;
    }

    // Unequip other items of the same category
    const item = getShopItems().find(i => i.id === itemId);
    if (item) {
      Object.keys(inventory.items).forEach(id => {
        const otherItem = getShopItems().find(i => i.id === id);
        if (otherItem && otherItem.category === item.category) {
          inventory.items[id].equipped = false;
        }
      });
    }

    inventory.items[itemId].equipped = true;
    saveUserInventory(inventory);
    return true;
  } catch (error) {
    console.error('Error equipping item:', error);
    return false;
  }
};

// Get equipped items
export const getEquippedItems = (): { [category: string]: string } => {
  const inventory = getUserInventory();
  const equipped: { [category: string]: string } = {};

  Object.entries(inventory.items).forEach(([itemId, itemData]) => {
    if (itemData.equipped) {
      const item = getShopItems().find(i => i.id === itemId);
      if (item) {
        equipped[item.category] = itemId;
      }
    }
  });

  return equipped;
};

// Get shop stats
export const getShopStats = (): ShopStats => {
  const items = getShopItems();
  const inventory = getUserInventory();
  
  return {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'available').length,
    comingSoonItems: items.filter(item => item.status === 'coming_soon').length,
    totalPurchases: Object.keys(inventory.items).length,
    totalRevenue: Object.values(inventory.items).reduce((total, item) => {
      const shopItem = items.find(i => i.id === Object.keys(inventory.items).find(id => inventory.items[id] === item));
      return total + (shopItem?.price || 0);
    }, 0)
  };
};

// Get available items (not coming soon)
export const getAvailableItems = (): ShopItem[] => {
  return getShopItems().filter(item => item.status === 'available');
};

// Get coming soon items
export const getComingSoonItems = (): ShopItem[] => {
  return getShopItems().filter(item => item.status === 'coming_soon');
};

// Clear all owned items (for testing purposes)
export const clearAllOwnedItems = (): void => {
  const emptyInventory: UserInventory = {
    items: {},
    equippedItems: {},
    purchaseHistory: [],
    totalSpent: 0
  };
  
  saveUserInventory(emptyInventory);
};
