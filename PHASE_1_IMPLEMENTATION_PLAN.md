# 🎮 Phase 1: Core Competitive System + Global Leaderboard
## Comprehensive Implementation Plan

## 📋 **Current System Analysis**

### ✅ **What We Have:**
- Volume-based ELO system (correct answers × 4.0 points)
- Accuracy multipliers (0.1x to 1.5x)
- Rank-based bonuses (Iron gets up to 3.5x multiplier)
- Difficulty modifiers (Easy: 0.7x, Medium: 1.0x, Hard: 1.3x)
- Time modifiers (±5%)
- Volume bonuses (+5% for 15+, +10% for 20+)
- 1:1 ELO to LP conversion
- Scaled ELO ranges (Challenger: 11,200+ ELO)

### ❌ **What We're Missing (Phase 1):**
1. **ELO Loss System** - No competitive tension
2. **Performance-Based Win/Loss** - No meaningful game outcomes
3. **Global Leaderboard** - No social competition
4. **Streak Bonuses** - No engagement hooks

---

## 🎯 **Phase 1 Implementation Plan**

### **Core Philosophy**: "Risk vs Reward with Social Competition"

Transform from "positive-only progression" to "competitive progression with social proof"
**Simplified**: No promotion/demotion series - just pure ELO gains/losses with leaderboards

---

## 📊 **1. ELO Loss System Implementation**

### **New Game Outcome Logic:**
```typescript
interface GameOutcome {
  result: 'win' | 'loss' | 'draw';
  performanceScore: number; // 0-100
  eloChange: number; // Can be negative
  lpChange: number; // 1:1 with ELO
}
```

### **Performance-Based Win/Loss:**
```typescript
const determineGameOutcome = (accuracy: number, questionsAnswered: number, difficulty: string): GameOutcome => {
  // Base performance score
  const baseScore = (accuracy / 100) * questionsAnswered;
  
  // Difficulty adjustment
  const difficultyMultiplier = getDifficultyMultiplier(difficulty);
  const adjustedScore = baseScore * difficultyMultiplier;
  
  // Determine outcome
  let result: 'win' | 'loss' | 'draw';
  if (adjustedScore >= 8) result = 'win';      // Strong performance
  else if (adjustedScore >= 5) result = 'draw'; // Decent performance  
  else result = 'loss';                        // Poor performance
  
  return {
    result,
    performanceScore: Math.min(100, adjustedScore * 10),
    eloChange: calculateEloChange(result, adjustedScore, difficulty),
    lpChange: calculateEloChange(result, adjustedScore, difficulty) // 1:1 conversion
  };
};
```

### **ELO Change Calculation:**
```typescript
const calculateEloChange = (result: string, performanceScore: number, difficulty: string): number => {
  const baseChange = result === 'win' ? 25 : result === 'loss' ? -25 : 0;
  
  // Performance modifier (0.5x to 2.0x)
  const performanceModifier = calculatePerformanceModifier(performanceScore);
  
  // Difficulty modifier
  const difficultyModifier = getDifficultyMultiplier(difficulty);
  
  // Rank-based adjustment (lower ranks get bonuses)
  const rankModifier = getRankModifier(currentElo);
  
  const finalChange = baseChange * performanceModifier * difficultyModifier * rankModifier;
  
  return Math.round(finalChange);
};
```

### **Performance Modifier Examples:**
- **Perfect Game** (100% accuracy, 15+ questions): 2.0x = +50 ELO
- **Great Game** (90% accuracy, 12+ questions): 1.5x = +37 ELO
- **Good Game** (75% accuracy, 10+ questions): 1.0x = +25 ELO
- **Average Game** (60% accuracy, 8+ questions): 0.8x = +20 ELO
- **Poor Game** (40% accuracy, 5+ questions): 0.6x = +15 ELO
- **Bad Loss** (25% accuracy, 3+ questions): 0.4x = -10 ELO
- **Terrible Loss** (15% accuracy, 2+ questions): 0.2x = -5 ELO

---

## 🏆 **2. Global Leaderboard System**

### **Database Schema:**
```typescript
interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  currentElo: number;
  peakElo: number;
  rank: string;
  division: string;
  gamesPlayed: number;
  winRate: number;
  winStreak: number;
  lastActive: Date;
  country?: string;
  categoryElo: Record<string, number>; // Per-category ELO
}

interface LeaderboardData {
  global: LeaderboardEntry[];
  regional: Record<string, LeaderboardEntry[]>; // By country
  category: Record<string, LeaderboardEntry[]>; // By category
  friends: LeaderboardEntry[]; // User's friends
}
```

### **Leaderboard Types:**
1. **Global Overall** - Top 100 players worldwide
2. **Regional** - Top 50 by country/region
3. **Category-Specific** - Top 25 per category (tech, marketing, etc.)
4. **Friends** - Compare with friends
5. **Weekly/Monthly** - Time-based rankings

### **Leaderboard Features:**
- **Real-time Updates** - Updates after each game
- **Rank Changes** - Show rank up/down animations
- **Achievement Badges** - "Rising Star", "Consistent Player", etc.
- **Profile Links** - Click to view player profiles
- **Filter Options** - By rank, country, category

### **UI Components:**
```typescript
// Main Leaderboard Page
<LeaderboardPage>
  <LeaderboardTabs>
    <Tab label="Global" />
    <Tab label="Regional" />
    <Tab label="Tech" />
    <Tab label="Marketing" />
    <Tab label="Friends" />
  </LeaderboardTabs>
  
  <LeaderboardTable>
    <LeaderboardRow rank={1} player={topPlayer} />
    <LeaderboardRow rank={2} player={secondPlayer} />
    // ... more rows
  </LeaderboardTable>
</LeaderboardPage>

// Leaderboard Row Component
<LeaderboardRow>
  <RankBadge rank={rank} />
  <PlayerAvatar avatar={player.avatar} />
  <PlayerInfo name={player.username} country={player.country} />
  <EloDisplay current={player.currentElo} change={player.eloChange} />
  <StatsDisplay games={player.gamesPlayed} winRate={player.winRate} />
  <StreakBadge streak={player.winStreak} />
</LeaderboardRow>
```

---

## 🔥 **3. Streak Bonuses**

### **Win Streak Bonuses:**
```typescript
const getStreakBonus = (winStreak: number): number => {
  if (winStreak >= 10) return 0.5; // +50% ELO
  if (winStreak >= 7) return 0.3;  // +30% ELO
  if (winStreak >= 5) return 0.2;  // +20% ELO
  if (winStreak >= 3) return 0.1;  // +10% ELO
  return 0;
};
```

### **Loss Streak Protection:**
```typescript
const getLossProtection = (lossStreak: number): number => {
  if (lossStreak >= 5) return 0.3; // -30% ELO loss
  if (lossStreak >= 3) return 0.2;  // -20% ELO loss
  return 0;
};
```

---

## 📁 **File Structure & Implementation**

### **New Files to Create:**
```
src/
├── lib/
│   ├── competitiveEloSystem.ts     # New competitive ELO logic
│   ├── leaderboardSystem.ts        # Leaderboard management
│   └── streakSystem.ts            # Streak bonuses
├── components/
│   ├── leaderboard/
│   │   ├── LeaderboardPage.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── LeaderboardRow.tsx
│   │   ├── RankBadge.tsx
│   │   └── PlayerProfile.tsx
│   └── competitive/
│       └── StreakIndicator.tsx
├── pages/
│   └── Leaderboard.tsx            # New leaderboard page
└── types/
    ├── competitive.ts             # Competitive system types
    └── leaderboard.ts             # Leaderboard types
```

### **Files to Modify:**
```
src/
├── lib/
│   ├── eloRewardsSystem.ts        # Add ELO loss logic
│   ├── eloRankSystem.ts          # Add promotion series
│   └── userStorage.ts            # Add leaderboard data
├── components/
│   └── game/
│       └── GameOverScreen.tsx    # Show win/loss, streaks
└── pages/
    └── Game.tsx                  # Update game outcome logic
```

---

## 🗂️ **Detailed Implementation Checklist**

### **Phase 1A: Core Competitive System (Week 1)**

#### **Day 1-2: ELO Loss System**
- [ ] Create `competitiveEloSystem.ts`
- [ ] Implement `determineGameOutcome()` function
- [ ] Add performance-based win/loss logic
- [ ] Update `eloRewardsSystem.ts` to support negative ELO
- [ ] Test ELO loss scenarios

#### **Day 3-4: Performance Modifiers**
- [ ] Implement `calculatePerformanceModifier()` function
- [ ] Add difficulty-based outcome adjustments
- [ ] Create performance modifier curve (0.5x to 2.0x)
- [ ] Test various performance scenarios

#### **Day 5: Game Outcome Integration**
- [ ] Update `Game.tsx` to use new outcome system
- [ ] Modify `GameOverScreen.tsx` to show win/loss
- [ ] Add ELO change animations
- [ ] Test end-to-end game flow

### **Phase 1B: Streak System (Week 2)**

#### **Day 1-2: Streak Tracking**
- [ ] Create `streakSystem.ts`
- [ ] Implement win/loss streak tracking
- [ ] Add streak bonuses to ELO calculation
- [ ] Update user storage to track streaks

#### **Day 3-4: Streak UI**
- [ ] Create `StreakIndicator.tsx` component
- [ ] Add streak display to game over screen
- [ ] Show streak bonuses in ELO breakdown
- [ ] Add streak animations

#### **Day 5: Streak Testing**
- [ ] Test win streak bonuses
- [ ] Test loss streak protection
- [ ] Verify streak persistence
- [ ] Test streak reset logic

### **Phase 1C: Global Leaderboard (Week 3)**

#### **Day 1-2: Leaderboard Data Structure**
- [ ] Create `leaderboardSystem.ts`
- [ ] Design leaderboard data schema
- [ ] Implement leaderboard calculation logic
- [ ] Add real-time update system

#### **Day 3-4: Leaderboard UI**
- [ ] Create `LeaderboardPage.tsx`
- [ ] Build `LeaderboardTable.tsx` component
- [ ] Implement `LeaderboardRow.tsx` component
- [ ] Add filtering and sorting

#### **Day 5: Leaderboard Integration**
- [ ] Add leaderboard to navigation
- [ ] Implement profile links
- [ ] Add achievement badges
- [ ] Test leaderboard updates

---

## 🧪 **Testing Scenarios**

### **ELO Loss System:**
1. **Perfect Game** (100% accuracy, 15+ questions): +50 ELO
2. **Great Game** (90% accuracy, 12+ questions): +37 ELO
3. **Good Game** (75% accuracy, 10+ questions): +25 ELO
4. **Average Game** (60% accuracy, 8+ questions): +20 ELO
5. **Poor Game** (40% accuracy, 5+ questions): +15 ELO
6. **Bad Loss** (25% accuracy, 3+ questions): -10 ELO
7. **Terrible Loss** (15% accuracy, 2+ questions): -5 ELO

### **Streak System:**
1. **5-Game Win Streak**: +20% ELO bonus
2. **7-Game Win Streak**: +30% ELO bonus
3. **10-Game Win Streak**: +50% ELO bonus
4. **3-Game Loss Streak**: -20% ELO loss
5. **5-Game Loss Streak**: -30% ELO loss

### **Leaderboard:**
1. **Global Top 100** - Overall ELO ranking
2. **Regional Top 50** - By country/region
3. **Category Top 25** - Per category (tech, marketing, etc.)
4. **Friends Ranking** - Compare with friends

---

## 📊 **Expected Impact**

### **Player Retention:**
- **Current**: Players leave after reaching plateau
- **New**: Players stay to avoid demotion and chase promotions

### **Engagement:**
- **Current**: Casual play with no stakes
- **New**: Competitive tension drives daily play

### **Social Features:**
- **Current**: Solo experience
- **New**: Community competition and bragging rights

### **Progression Feel:**
- **Current**: Linear grind
- **New**: Meaningful achievements with risk/reward

---

## 🎮 **Why This Works (Game Psychology)**

1. **Loss Aversion**: People hate losing more than they love winning
2. **Variable Rewards**: Unpredictable outcomes are more addictive
3. **Social Proof**: Seeing others' ranks drives competition
4. **Progression Fantasy**: Clear path to improvement
5. **FOMO**: Daily missions and decay create urgency

---

## 🚀 **Success Metrics**

### **Week 1 Targets:**
- ELO loss system implemented
- Performance modifiers working
- Game outcomes showing win/loss

### **Week 2 Targets:**
- Streak bonuses active
- Streak UI implemented
- Streak persistence working

### **Week 3 Targets:**
- Global leaderboard live
- Real-time updates working
- Leaderboard UI polished

---

## 📝 **Next Steps**

1. **Review this plan** with the team
2. **Prioritize features** based on impact
3. **Set up development timeline**
4. **Create detailed technical specs**
5. **Begin implementation** with Phase 1A

This system transforms BoltQuest from a "learning tool" into a "competitive platform" that players will return to daily, just like successful esports games.
