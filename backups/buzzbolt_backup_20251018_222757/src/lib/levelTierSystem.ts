// Dynamic Level Tier System for BoltQuest
// Creates engaging visual progression with 10 tiers and color schemes

export interface LevelTier {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  icon: string;
  description: string;
  glowColor: string;
  badgeColor: string;
}

export interface LevelIndicator {
  tier: LevelTier;
  progressInTier: number; // 0-100%
  levelInTier: number; // 1-10
  totalProgress: number; // Overall progress to next tier
  nextTier: LevelTier | null;
  isMaxTier: boolean;
}

// 10-Tier System with Beautiful Color Progression
export const LEVEL_TIERS: LevelTier[] = [
  {
    id: 1,
    name: "Novice",
    minLevel: 1,
    maxLevel: 20,
    primaryColor: "#ffffff",
    secondaryColor: "#f3f4f6",
    gradient: "from-white to-gray-100",
    icon: "🌱",
    description: "Starting your journey",
    glowColor: "shadow-white/20",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-300"
  },
  {
    id: 2,
    name: "Apprentice",
    minLevel: 21,
    maxLevel: 40,
    primaryColor: "#3b82f6",
    secondaryColor: "#1d4ed8",
    gradient: "from-blue-400 to-blue-600",
    icon: "📚",
    description: "Learning the basics",
    glowColor: "shadow-blue-500/30",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300"
  },
  {
    id: 3,
    name: "Skilled",
    minLevel: 41,
    maxLevel: 60,
    primaryColor: "#10b981",
    secondaryColor: "#047857",
    gradient: "from-green-400 to-green-600",
    icon: "🎯",
    description: "Developing expertise",
    glowColor: "shadow-green-500/30",
    badgeColor: "bg-green-100 text-green-800 border-green-300"
  },
  {
    id: 4,
    name: "Expert",
    minLevel: 61,
    maxLevel: 80,
    primaryColor: "#f59e0b",
    secondaryColor: "#d97706",
    gradient: "from-yellow-400 to-yellow-600",
    icon: "⭐",
    description: "Mastering your craft",
    glowColor: "shadow-yellow-500/30",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300"
  },
  {
    id: 5,
    name: "Master",
    minLevel: 81,
    maxLevel: 100,
    primaryColor: "#ef4444",
    secondaryColor: "#dc2626",
    gradient: "from-red-400 to-red-600",
    icon: "🔥",
    description: "Reaching mastery",
    glowColor: "shadow-red-500/30",
    badgeColor: "bg-red-100 text-red-800 border-red-300"
  },
  {
    id: 6,
    name: "Elite",
    minLevel: 101,
    maxLevel: 120,
    primaryColor: "#8b5cf6",
    secondaryColor: "#7c3aed",
    gradient: "from-purple-400 to-purple-600",
    icon: "👑",
    description: "Elite performance",
    glowColor: "shadow-purple-500/30",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300"
  },
  {
    id: 7,
    name: "Legend",
    minLevel: 121,
    maxLevel: 140,
    primaryColor: "#ec4899",
    secondaryColor: "#db2777",
    gradient: "from-pink-400 to-pink-600",
    icon: "🌟",
    description: "Legendary status",
    glowColor: "shadow-pink-500/30",
    badgeColor: "bg-pink-100 text-pink-800 border-pink-300"
  },
  {
    id: 8,
    name: "Mythic",
    minLevel: 141,
    maxLevel: 160,
    primaryColor: "#06b6d4",
    secondaryColor: "#0891b2",
    gradient: "from-cyan-400 to-cyan-600",
    icon: "💎",
    description: "Mythical power",
    glowColor: "shadow-cyan-500/30",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300"
  },
  {
    id: 9,
    name: "Divine",
    minLevel: 161,
    maxLevel: 180,
    primaryColor: "#6b7280",
    secondaryColor: "#4b5563",
    gradient: "from-gray-400 to-gray-600",
    icon: "✨",
    description: "Divine wisdom",
    glowColor: "shadow-gray-500/30",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-300"
  },
  {
    id: 10,
    name: "Transcendent",
    minLevel: 181,
    maxLevel: 200,
    primaryColor: "#fbbf24",
    secondaryColor: "#f59e0b",
    gradient: "from-yellow-300 via-purple-400 to-pink-400",
    icon: "🌈",
    description: "Transcendent being",
    glowColor: "shadow-yellow-500/50",
    badgeColor: "bg-gradient-to-r from-yellow-100 via-purple-100 to-pink-100 text-gray-800 border-purple-300"
  }
];

export class LevelTierSystem {
  private tiers: LevelTier[] = LEVEL_TIERS;

  // Get tier information for a specific level
  getTierForLevel(level: number): LevelTier {
    const tier = this.tiers.find(t => level >= t.minLevel && level <= t.maxLevel);
    if (tier) return tier;
    
    // For levels above 200, return transcendent tier with special handling
    if (level > 200) {
      return {
        ...this.tiers[9], // Transcendent tier
        name: "Transcendent+",
        description: "Beyond transcendence",
        icon: "🚀"
      };
    }
    
    return this.tiers[0]; // Fallback to Novice
  }

  // Get detailed level indicator information
  getLevelIndicator(level: number): LevelIndicator {
    const tier = this.getTierForLevel(level);
    const levelInTier = level - tier.minLevel + 1;
    const progressInTier = ((level - tier.minLevel) / (tier.maxLevel - tier.minLevel + 1)) * 100;
    
    const currentTierIndex = this.tiers.findIndex(t => t.id === tier.id);
    const nextTier = currentTierIndex < this.tiers.length - 1 ? this.tiers[currentTierIndex + 1] : null;
    const isMaxTier = currentTierIndex === this.tiers.length - 1;
    
    // Calculate overall progress to next tier
    let totalProgress = 0;
    if (!isMaxTier && nextTier) {
      totalProgress = ((level - tier.minLevel) / (nextTier.minLevel - tier.minLevel)) * 100;
    } else if (isMaxTier) {
      totalProgress = 100;
    }

    return {
      tier,
      progressInTier: Math.min(100, Math.max(0, progressInTier)),
      levelInTier,
      totalProgress: Math.min(100, Math.max(0, totalProgress)),
      nextTier,
      isMaxTier
    };
  }

  // Get all tiers
  getAllTiers(): LevelTier[] {
    return [...this.tiers];
  }

  // Get tier by ID
  getTierById(id: number): LevelTier | null {
    return this.tiers.find(t => t.id === id) || null;
  }

  // Get tier by name
  getTierByName(name: string): LevelTier | null {
    return this.tiers.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Calculate levels until next tier
  getLevelsUntilNextTier(level: number): number {
    const indicator = this.getLevelIndicator(level);
    if (indicator.isMaxTier) return 0;
    
    const tier = this.getTierForLevel(level);
    return tier.maxLevel - level + 1;
  }

  // Get tier color for CSS
  getTierColor(level: number, type: 'primary' | 'secondary' | 'gradient'): string {
    const tier = this.getTierForLevel(level);
    switch (type) {
      case 'primary': return tier.primaryColor;
      case 'secondary': return tier.secondaryColor;
      case 'gradient': return tier.gradient;
      default: return tier.primaryColor;
    }
  }

  // Get tier badge styling
  getTierBadgeStyle(level: number): string {
    const tier = this.getTierForLevel(level);
    return tier.badgeColor;
  }

  // Get tier glow effect
  getTierGlowStyle(level: number): string {
    const tier = this.getTierForLevel(level);
    return tier.glowColor;
  }
}

// Utility functions
export const LevelTierUtils = {
  // Format level display with tier
  formatLevelDisplay: (level: number): string => {
    const system = new LevelTierSystem();
    const indicator = system.getLevelIndicator(level);
    return `${indicator.tier.icon} Level ${level} (${indicator.tier.name})`;
  },

  // Get tier icon
  getTierIcon: (level: number): string => {
    const system = new LevelTierSystem();
    const tier = system.getTierForLevel(level);
    return tier.icon;
  },

  // Get tier name
  getTierName: (level: number): string => {
    const system = new LevelTierSystem();
    const tier = system.getTierForLevel(level);
    return tier.name;
  },

  // Check if level is at tier boundary
  isTierBoundary: (level: number): boolean => {
    const system = new LevelTierSystem();
    const tier = system.getTierForLevel(level);
    return level === tier.minLevel || level === tier.maxLevel;
  },

  // Get tier progress percentage
  getTierProgress: (level: number): number => {
    const system = new LevelTierSystem();
    const indicator = system.getLevelIndicator(level);
    return indicator.progressInTier;
  }
};

export default LevelTierSystem;
