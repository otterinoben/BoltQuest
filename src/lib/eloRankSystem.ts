export interface EloRank {
  tier: string;
  division: string;
  minElo: number;
  maxElo: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export interface EloRankDisplay {
  currentRank: EloRank;
  lpGain: number;
  currentLP: number;
  nextRank?: EloRank;
  progressToNext: number;
}

export class EloRankSystem {
  private static ranks: EloRank[] = [
    // Iron Tier
    {
      tier: "Iron",
      division: "IV",
      minElo: 0,
      maxElo: 399,
      color: "#8B4513",
      bgColor: "linear-gradient(135deg, #8B4513, #A0522D)",
      borderColor: "#654321",
      icon: "⚔️",
      description: "Starting your journey"
    },
    {
      tier: "Iron",
      division: "III",
      minElo: 400,
      maxElo: 599,
      color: "#8B4513",
      bgColor: "linear-gradient(135deg, #8B4513, #A0522D)",
      borderColor: "#654321",
      icon: "⚔️",
      description: "Learning the basics"
    },
    {
      tier: "Iron",
      division: "II",
      minElo: 600,
      maxElo: 799,
      color: "#8B4513",
      bgColor: "linear-gradient(135deg, #8B4513, #A0522D)",
      borderColor: "#654321",
      icon: "⚔️",
      description: "Building foundations"
    },
    {
      tier: "Iron",
      division: "I",
      minElo: 800,
      maxElo: 999,
      color: "#8B4513",
      bgColor: "linear-gradient(135deg, #8B4513, #A0522D)",
      borderColor: "#654321",
      icon: "⚔️",
      description: "Ready to advance"
    },
    
    // Bronze Tier
    {
      tier: "Bronze",
      division: "IV",
      minElo: 1000,
      maxElo: 1199,
      color: "#CD7F32",
      bgColor: "linear-gradient(135deg, #CD7F32, #B8860B)",
      borderColor: "#8B4513",
      icon: "🥉",
      description: "Bronze foundations"
    },
    {
      tier: "Bronze",
      division: "III",
      minElo: 1200,
      maxElo: 1399,
      color: "#CD7F32",
      bgColor: "linear-gradient(135deg, #CD7F32, #B8860B)",
      borderColor: "#8B4513",
      icon: "🥉",
      description: "Steady progress"
    },
    {
      tier: "Bronze",
      division: "II",
      minElo: 1400,
      maxElo: 1599,
      color: "#CD7F32",
      bgColor: "linear-gradient(135deg, #CD7F32, #B8860B)",
      borderColor: "#8B4513",
      icon: "🥉",
      description: "Improving skills"
    },
    {
      tier: "Bronze",
      division: "I",
      minElo: 1600,
      maxElo: 1799,
      color: "#CD7F32",
      bgColor: "linear-gradient(135deg, #CD7F32, #B8860B)",
      borderColor: "#8B4513",
      icon: "🥉",
      description: "Bronze mastery"
    },
    
    // Silver Tier
    {
      tier: "Silver",
      division: "IV",
      minElo: 1800,
      maxElo: 1999,
      color: "#C0C0C0",
      bgColor: "linear-gradient(135deg, #C0C0C0, #D3D3D3)",
      borderColor: "#A9A9A9",
      icon: "🥈",
      description: "Silver precision"
    },
    {
      tier: "Silver",
      division: "III",
      minElo: 2000,
      maxElo: 2199,
      color: "#C0C0C0",
      bgColor: "linear-gradient(135deg, #C0C0C0, #D3D3D3)",
      borderColor: "#A9A9A9",
      icon: "🥈",
      description: "Refined technique"
    },
    {
      tier: "Silver",
      division: "II",
      minElo: 2200,
      maxElo: 2399,
      color: "#C0C0C0",
      bgColor: "linear-gradient(135deg, #C0C0C0, #D3D3D3)",
      borderColor: "#A9A9A9",
      icon: "🥈",
      description: "Silver excellence"
    },
    {
      tier: "Silver",
      division: "I",
      minElo: 2400,
      maxElo: 2599,
      color: "#C0C0C0",
      bgColor: "linear-gradient(135deg, #C0C0C0, #D3D3D3)",
      borderColor: "#A9A9A9",
      icon: "🥈",
      description: "Silver mastery"
    },
    
    // Gold Tier
    {
      tier: "Gold",
      division: "IV",
      minElo: 2600,
      maxElo: 2799,
      color: "#FFD700",
      bgColor: "linear-gradient(135deg, #FFD700, #FFA500)",
      borderColor: "#DAA520",
      icon: "🥇",
      description: "Golden potential"
    },
    {
      tier: "Gold",
      division: "III",
      minElo: 2800,
      maxElo: 2999,
      color: "#FFD700",
      bgColor: "linear-gradient(135deg, #FFD700, #FFA500)",
      borderColor: "#DAA520",
      icon: "🥇",
      description: "Gold standard"
    },
    {
      tier: "Gold",
      division: "II",
      minElo: 3000,
      maxElo: 3199,
      color: "#FFD700",
      bgColor: "linear-gradient(135deg, #FFD700, #FFA500)",
      borderColor: "#DAA520",
      icon: "🥇",
      description: "Gold excellence"
    },
    {
      tier: "Gold",
      division: "I",
      minElo: 3200,
      maxElo: 3399,
      color: "#FFD700",
      bgColor: "linear-gradient(135deg, #FFD700, #FFA500)",
      borderColor: "#DAA520",
      icon: "🥇",
      description: "Gold mastery"
    },
    
    // Platinum Tier
    {
      tier: "Platinum",
      division: "IV",
      minElo: 3400,
      maxElo: 3599,
      color: "#00CED1",
      bgColor: "linear-gradient(135deg, #00CED1, #20B2AA)",
      borderColor: "#008B8B",
      icon: "💎",
      description: "Platinum precision"
    },
    {
      tier: "Platinum",
      division: "III",
      minElo: 3600,
      maxElo: 3799,
      color: "#00CED1",
      bgColor: "linear-gradient(135deg, #00CED1, #20B2AA)",
      borderColor: "#008B8B",
      icon: "💎",
      description: "Platinum skill"
    },
    {
      tier: "Platinum",
      division: "II",
      minElo: 3800,
      maxElo: 3999,
      color: "#00CED1",
      bgColor: "linear-gradient(135deg, #00CED1, #20B2AA)",
      borderColor: "#008B8B",
      icon: "💎",
      description: "Platinum excellence"
    },
    {
      tier: "Platinum",
      division: "I",
      minElo: 4000,
      maxElo: 4199,
      color: "#00CED1",
      bgColor: "linear-gradient(135deg, #00CED1, #20B2AA)",
      borderColor: "#008B8B",
      icon: "💎",
      description: "Platinum mastery"
    },
    
    // Diamond Tier
    {
      tier: "Diamond",
      division: "IV",
      minElo: 4200,
      maxElo: 4399,
      color: "#B9F2FF",
      bgColor: "linear-gradient(135deg, #B9F2FF, #87CEEB)",
      borderColor: "#4682B4",
      icon: "💠",
      description: "Diamond brilliance"
    },
    {
      tier: "Diamond",
      division: "III",
      minElo: 4400,
      maxElo: 4599,
      color: "#B9F2FF",
      bgColor: "linear-gradient(135deg, #B9F2FF, #87CEEB)",
      borderColor: "#4682B4",
      icon: "💠",
      description: "Diamond expertise"
    },
    {
      tier: "Diamond",
      division: "II",
      minElo: 4600,
      maxElo: 4799,
      color: "#B9F2FF",
      bgColor: "linear-gradient(135deg, #B9F2FF, #87CEEB)",
      borderColor: "#4682B4",
      icon: "💠",
      description: "Diamond excellence"
    },
    {
      tier: "Diamond",
      division: "I",
      minElo: 4800,
      maxElo: 4999,
      color: "#B9F2FF",
      bgColor: "linear-gradient(135deg, #B9F2FF, #87CEEB)",
      borderColor: "#4682B4",
      icon: "💠",
      description: "Diamond mastery"
    },
    
    // Master Tier
    {
      tier: "Master",
      division: "",
      minElo: 5000,
      maxElo: 5999,
      color: "#8A2BE2",
      bgColor: "linear-gradient(135deg, #8A2BE2, #9932CC)",
      borderColor: "#4B0082",
      icon: "👑",
      description: "Master level"
    },
    
    // Grandmaster Tier
    {
      tier: "Grandmaster",
      division: "",
      minElo: 6000,
      maxElo: 6999,
      color: "#FF4500",
      bgColor: "linear-gradient(135deg, #FF4500, #FF6347)",
      borderColor: "#DC143C",
      icon: "🏆",
      description: "Grandmaster elite"
    },
    
    // Challenger Tier
    {
      tier: "Challenger",
      division: "",
      minElo: 7000,
      maxElo: 9999,
      color: "#FFD700",
      bgColor: "linear-gradient(135deg, #FFD700, #FFA500, #FF6347)",
      borderColor: "#DAA520",
      icon: "🌟",
      description: "Challenger legend"
    }
  ];

  static getRankByElo(elo: number): EloRank {
    const rank = this.ranks.find(r => elo >= r.minElo && elo <= r.maxElo);
    return rank || this.ranks[0]; // Fallback to Iron IV
  }

  static getEloRankDisplay(currentElo: number, eloChange: number): EloRankDisplay {
    const currentRank = this.getRankByElo(currentElo);
    const nextRank = this.ranks.find(r => r.minElo > currentElo);
    
    // Calculate LP within current rank (0-100)
    const lpInRank = ((currentElo - currentRank.minElo) / (currentRank.maxElo - currentRank.minElo)) * 100;
    const currentLP = Math.round(lpInRank);
    
    // Calculate LP gain based on ELO change
    const lpGain = Math.round((eloChange / (currentRank.maxElo - currentRank.minElo)) * 100);
    
    // Calculate progress to next rank
    const progressToNext = nextRank ? 
      ((currentElo - currentRank.minElo) / (nextRank.minElo - currentRank.minElo)) * 100 : 100;

    return {
      currentRank,
      lpGain,
      currentLP: Math.max(0, Math.min(100, currentLP)),
      nextRank,
      progressToNext: Math.max(0, Math.min(100, progressToNext))
    };
  }

  static getRankEmblemStyle(rank: EloRank): React.CSSProperties {
    return {
      background: rank.bgColor,
      border: `3px solid ${rank.borderColor}`,
      boxShadow: `0 0 20px ${rank.color}40, inset 0 0 20px ${rank.color}20`,
      color: rank.color
    };
  }

  static getLpChangeColor(lpGain: number): string {
    if (lpGain > 0) return "#00FF00"; // Green for gains
    if (lpGain < 0) return "#FF0000"; // Red for losses
    return "#FFFFFF"; // White for no change
  }

  static getLpChangeText(lpGain: number): string {
    if (lpGain > 0) return `+${lpGain} LP`;
    if (lpGain < 0) return `${lpGain} LP`;
    return "0 LP";
  }
}
