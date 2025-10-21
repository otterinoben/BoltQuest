import { getUserInventory } from './shopSystem';

export interface Title {
  id: string;
  name: string;
  description: string;
  category: 'level' | 'rank' | 'shop' | 'achievement';
  unlockRequirement?: {
    level?: number;
    rank?: string;
    achievement?: string;
    shopItem?: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export const TITLES: Title[] = [
  // Level-based titles
  {
    id: 'novice',
    name: 'Novice',
    description: 'Just starting your journey',
    category: 'level',
    unlockRequirement: { level: 1 },
    rarity: 'common'
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Learning the ropes',
    category: 'level',
    unlockRequirement: { level: 5 },
    rarity: 'common'
  },
  {
    id: 'skilled',
    name: 'Skilled',
    description: 'Getting the hang of it',
    category: 'level',
    unlockRequirement: { level: 10 },
    rarity: 'uncommon'
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Mastering your craft',
    category: 'level',
    unlockRequirement: { level: 20 },
    rarity: 'rare'
  },
  {
    id: 'master',
    name: 'Master',
    description: 'A true knowledge seeker',
    category: 'level',
    unlockRequirement: { level: 35 },
    rarity: 'epic'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Legendary wisdom',
    category: 'level',
    unlockRequirement: { level: 50 },
    rarity: 'legendary'
  },

  // Rank-based titles (unlocked when reaching that rank)
  {
    id: 'iron-warrior',
    name: 'Iron Warrior',
    description: 'Conquered the Iron ranks',
    category: 'rank',
    unlockRequirement: { rank: 'Iron' },
    rarity: 'common'
  },
  {
    id: 'bronze-champion',
    name: 'Bronze Champion',
    description: 'Rose through Bronze',
    category: 'rank',
    unlockRequirement: { rank: 'Bronze' },
    rarity: 'uncommon'
  },
  {
    id: 'silver-sage',
    name: 'Silver Sage',
    description: 'Achieved Silver mastery',
    category: 'rank',
    unlockRequirement: { rank: 'Silver' },
    rarity: 'rare'
  },
  {
    id: 'golden-genius',
    name: 'Golden Genius',
    description: 'Reached Gold excellence',
    category: 'rank',
    unlockRequirement: { rank: 'Gold' },
    rarity: 'epic'
  },
  {
    id: 'platinum-prodigy',
    name: 'Platinum Prodigy',
    description: 'Ascended to Platinum',
    category: 'rank',
    unlockRequirement: { rank: 'Platinum' },
    rarity: 'epic'
  },
  {
    id: 'diamond-destroyer',
    name: 'Diamond Destroyer',
    description: 'Shattered Diamond barriers',
    category: 'rank',
    unlockRequirement: { rank: 'Diamond' },
    rarity: 'legendary'
  },
  {
    id: 'master-elite',
    name: 'Master Elite',
    description: 'Joined the Master ranks',
    category: 'rank',
    unlockRequirement: { rank: 'Master' },
    rarity: 'legendary'
  },
  {
    id: 'grandmaster-legend',
    name: 'Grandmaster Legend',
    description: 'Became a Grandmaster',
    category: 'rank',
    unlockRequirement: { rank: 'Grandmaster' },
    rarity: 'legendary'
  },
  {
    id: 'challenger-god',
    name: 'Challenger God',
    description: 'Reached the pinnacle',
    category: 'rank',
    unlockRequirement: { rank: 'Challenger' },
    rarity: 'legendary'
  },

  // Shop titles (for purchase with coins)
  {
    id: 'beta-tester',
    name: 'Beta Tester',
    description: 'Helped shape the future of BuzzBolt',
    category: 'shop',
    unlockRequirement: { shopItem: 'beta-tester-title' },
    rarity: 'epic'
  },
  {
    id: 'og-member',
    name: 'OG Member',
    description: 'One of the original BuzzBolt pioneers',
    category: 'shop',
    unlockRequirement: { shopItem: 'og-member-title' },
    rarity: 'legendary'
  },
  {
    id: 'coin-collector',
    name: 'Coin Collector',
    description: 'Master of the coin economy',
    category: 'shop',
    unlockRequirement: { shopItem: 'coin-collector-title' },
    rarity: 'rare'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Ultimate quiz knowledge seeker',
    category: 'shop',
    unlockRequirement: { shopItem: 'quiz-master-title' },
    rarity: 'epic'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Lightning-fast answer machine',
    category: 'shop',
    unlockRequirement: { shopItem: 'speed-demon-title' },
    rarity: 'rare'
  },
  {
    id: 'accuracy-king',
    name: 'Accuracy King',
    description: 'Perfectionist extraordinaire',
    category: 'shop',
    unlockRequirement: { shopItem: 'accuracy-king-title' },
    rarity: 'epic'
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    description: 'Unstoppable momentum master',
    category: 'shop',
    unlockRequirement: { shopItem: 'streak-champion-title' },
    rarity: 'rare'
  },
  {
    id: 'elite-gamer',
    name: 'Elite Gamer',
    description: 'Top-tier gaming excellence',
    category: 'shop',
    unlockRequirement: { shopItem: 'elite-gamer-title' },
    rarity: 'legendary'
  },

  // Achievement-based titles
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Achieved incredible streaks',
    category: 'achievement',
    unlockRequirement: { achievement: 'streak-master' },
    rarity: 'rare'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Lightning-fast answers',
    category: 'achievement',
    unlockRequirement: { achievement: 'speed-demon' },
    rarity: 'epic'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: '100% accuracy master',
    category: 'achievement',
    unlockRequirement: { achievement: 'perfectionist' },
    rarity: 'legendary'
  }
];

export class TitleManager {
  private static instance: TitleManager;
  private userProfile: any;

  static getInstance(): TitleManager {
    if (!TitleManager.instance) {
      TitleManager.instance = new TitleManager();
    }
    return TitleManager.instance;
  }

  initialize(userProfile: any) {
    this.userProfile = userProfile;
  }

  // Get all available titles for the user
  getAvailableTitles(): Title[] {
    if (!this.userProfile) return [];

    const availableTitles: Title[] = [];
    
    for (const title of TITLES) {
      if (this.isTitleUnlocked(title)) {
        availableTitles.push(title);
      }
    }

    return availableTitles;
  }

  // Check if a title is unlocked
  isTitleUnlocked(title: Title): boolean {
    if (!this.userProfile) return false;

    const requirement = title.unlockRequirement;
    if (!requirement) return true;

    // Check level requirement
    if (requirement.level && this.userProfile.level < requirement.level) {
      return false;
    }

    // Check rank requirement
    if (requirement.rank) {
      const currentRank = this.getCurrentRank();
      if (!this.hasReachedRank(requirement.rank, currentRank)) {
        return false;
      }
    }

    // Check achievement requirement
    if (requirement.achievement) {
      // TODO: Implement achievement checking
      return false;
    }

    // Check shop item requirement
    if (requirement.shopItem) {
      const inventory = getUserInventory();
      return inventory.items[requirement.shopItem] !== undefined;
    }

    return true;
  }

  // Get current rank from ELO
  private getCurrentRank(): string {
    if (!this.userProfile) return 'Iron';
    
    // Get ELO rating from user profile
    const eloRating = this.userProfile.eloRating?.overall || 1000;
    
    // Convert ELO to rank using the same logic as EloRankSystem
    if (eloRating >= 11200) return 'Challenger';
    if (eloRating >= 9600) return 'Grandmaster';
    if (eloRating >= 8000) return 'Master';
    if (eloRating >= 6400) return 'Diamond';
    if (eloRating >= 4800) return 'Platinum';
    if (eloRating >= 3200) return 'Gold';
    if (eloRating >= 1600) return 'Silver';
    if (eloRating >= 800) return 'Bronze';
    return 'Iron';
  }

  // Check if user has reached a specific rank
  private hasReachedRank(targetRank: string, currentRank: string): boolean {
    const rankOrder = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
    const currentIndex = rankOrder.indexOf(currentRank);
    const targetIndex = rankOrder.indexOf(targetRank);
    
    return currentIndex >= targetIndex;
  }

  // Get the best available title for the user
  getBestTitle(): Title {
    const availableTitles = this.getAvailableTitles();
    
    if (availableTitles.length === 0) {
      return TITLES.find(t => t.id === 'novice') || TITLES[0];
    }

    // Sort by rarity (legendary first) and then by level requirement
    return availableTitles.sort((a, b) => {
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      const levelA = a.unlockRequirement?.level || 0;
      const levelB = b.unlockRequirement?.level || 0;
      return levelB - levelA;
    })[0];
  }

  // Get title by ID
  getTitleById(id: string): Title | undefined {
    return TITLES.find(title => title.id === id);
  }

  // Get titles by category
  getTitlesByCategory(category: 'level' | 'rank' | 'shop' | 'achievement'): Title[] {
    return TITLES.filter(title => title.category === category);
  }

  // Get rarity color
  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  // Get rarity background
  getRarityBackground(rarity: string): string {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300';
      case 'uncommon': return 'bg-green-100 border-green-300';
      case 'rare': return 'bg-blue-100 border-blue-300';
      case 'epic': return 'bg-purple-100 border-purple-300';
      case 'legendary': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  }
}
