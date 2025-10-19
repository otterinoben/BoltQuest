# 🎯 BoltQuest True/False Game Mode - Implementation Plan

## **Concept: "Fact Check" Mode** ✅❌

### **How It Works**
- **Question Format**: A statement appears (e.g., "The capital of France is Paris")
- **User Action**: Player taps TRUE or FALSE button
- **Feedback**: Immediate visual feedback with explanation
- **Scoring**: Points for correct answers, bonus for speed
- **Duration**: 20 questions per game

---

## 🎮 **Game Flow**

### **1. Question Display**
```
┌─────────────────────────────────────┐
│  📊 FACT CHECK                      │
│                                     │
│  "The Great Wall of China is       │
│   visible from space with the       │
│   naked eye."                       │
│                                     │
│  Question 3 of 20                   │
│  ⏱️ 15 seconds remaining            │
└─────────────────────────────────────┘
```

### **2. Answer Selection**
```
┌─────────────────────────────────────┐
│  "The Great Wall of China is       │
│   visible from space with the       │
│   naked eye."                       │
│                                     │
│  [  ✅ TRUE  ]  [  ❌ FALSE  ]     │
│                                     │
│  ⏱️ 12 seconds remaining            │
└─────────────────────────────────────┘
```

### **3. Feedback Screen**
```
┌─────────────────────────────────────┐
│  ❌ FALSE - Correct!                │
│                                     │
│  💡 The Great Wall is NOT visible   │
│     from space with the naked eye.  │
│     It's only visible from low      │
│     Earth orbit with magnification. │
│                                     │
│  +50 points • +10 speed bonus       │
│                                     │
│  [ Continue ]                       │
└─────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **New Files to Create**

#### **1. True/False Game Component**
**File**: `src/components/game/TrueFalseGame.tsx`

```typescript
interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source?: string;
}

interface TrueFalseGameProps {
  questions: TrueFalseQuestion[];
  onComplete: (results: TrueFalseResults) => void;
  onQuit: () => void;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
  questions,
  onComplete,
  onQuit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  // Game logic here...
};
```

#### **2. True/False Question Generator**
**File**: `src/lib/trueFalseGenerator.ts`

```typescript
export interface TrueFalseQuestion {
  id: string;
  statement: string;
  answer: boolean;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source?: string;
}

export class TrueFalseGenerator {
  private static questions: TrueFalseQuestion[] = [
    // Easy Questions
    {
      id: 'tf-001',
      statement: 'The capital of France is Paris.',
      answer: true,
      explanation: 'Paris has been the capital of France since the 6th century.',
      category: 'Geography',
      difficulty: 'easy'
    },
    {
      id: 'tf-002',
      statement: 'Sharks are mammals.',
      answer: false,
      explanation: 'Sharks are fish, not mammals. They breathe through gills.',
      category: 'Science',
      difficulty: 'easy'
    },
    
    // Medium Questions
    {
      id: 'tf-003',
      statement: 'The Great Wall of China is visible from space with the naked eye.',
      answer: false,
      explanation: 'The Great Wall is NOT visible from space with the naked eye. It\'s only visible from low Earth orbit with magnification.',
      category: 'Geography',
      difficulty: 'medium'
    },
    {
      id: 'tf-004',
      statement: 'Goldfish have a memory span of only 3 seconds.',
      answer: false,
      explanation: 'Goldfish actually have a memory span of several months and can be trained to perform tricks.',
      category: 'Science',
      difficulty: 'medium'
    },
    
    // Hard Questions
    {
      id: 'tf-005',
      statement: 'The human brain uses 20% of the body\'s energy.',
      answer: true,
      explanation: 'The brain uses approximately 20% of the body\'s total energy, despite being only 2% of body weight.',
      category: 'Science',
      difficulty: 'hard'
    },
    {
      id: 'tf-006',
      statement: 'The speed of light is faster in water than in air.',
      answer: false,
      explanation: 'Light travels slower in water than in air due to the higher refractive index of water.',
      category: 'Science',
      difficulty: 'hard'
    }
  ];

  static generateQuestions(count: number = 20, difficulty?: string): TrueFalseQuestion[] {
    let filteredQuestions = this.questions;
    
    if (difficulty) {
      filteredQuestions = this.questions.filter(q => q.difficulty === difficulty);
    }
    
    // Shuffle and select
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  static getQuestionById(id: string): TrueFalseQuestion | undefined {
    return this.questions.find(q => q.id === id);
  }
}
```

#### **3. True/False Scoring System**
**File**: `src/lib/trueFalseScoring.ts`

```typescript
export interface TrueFalseResult {
  questionId: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
  speedBonus: number;
}

export interface TrueFalseGameResults {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  averageTime: number;
  accuracy: number;
  speedBonus: number;
  results: TrueFalseResult[];
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

export class TrueFalseScoring {
  static calculateScore(
    userAnswer: boolean,
    correctAnswer: boolean,
    timeSpent: number,
    maxTime: number = 15
  ): { points: number; speedBonus: number } {
    const basePoints = 50;
    const speedBonus = Math.max(0, (maxTime - timeSpent) * 2);
    
    if (userAnswer === correctAnswer) {
      return {
        points: basePoints,
        speedBonus: speedBonus
      };
    }
    
    return { points: 0, speedBonus: 0 };
  }

  static calculateGameResults(results: TrueFalseResult[]): TrueFalseGameResults {
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const totalPoints = results.reduce((sum, r) => sum + r.pointsEarned + r.speedBonus, 0);
    const averageTime = results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length;
    
    // Category breakdown
    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    results.forEach(result => {
      // This would need the question data to get category
      // Implementation depends on how we store question data
    });

    return {
      totalQuestions: results.length,
      correctAnswers,
      totalPoints,
      averageTime,
      accuracy: (correctAnswers / results.length) * 100,
      speedBonus: results.reduce((sum, r) => sum + r.speedBonus, 0),
      results,
      categoryBreakdown
    };
  }
}
```

---

## 🎨 **UI/UX Design**

### **Question Display**
- **Large, clear statement** in readable font
- **Timer** prominently displayed
- **Progress indicator** (Question X of 20)
- **Category badge** (optional)

### **Answer Buttons**
- **Large, touch-friendly** buttons
- **Clear TRUE/FALSE** labels with icons
- **Hover/active states** with animations
- **Color coding**: Green for TRUE, Red for FALSE

### **Feedback Screen**
- **Immediate visual feedback** (checkmark/X)
- **Explanation text** with helpful context
- **Points earned** display
- **Speed bonus** indicator
- **Continue button** to proceed

### **Results Screen**
- **Overall accuracy** percentage
- **Total points** earned
- **Speed analysis** (average time per question)
- **Category breakdown** (if applicable)
- **Share results** option

---

## 📊 **Question Database**

### **Categories**
- **Geography**: Countries, capitals, landmarks
- **Science**: Biology, physics, chemistry
- **History**: Historical events, dates, figures
- **Technology**: Computers, internet, AI
- **Sports**: Rules, records, athletes
- **Entertainment**: Movies, music, books
- **General Knowledge**: Mixed topics

### **Difficulty Levels**
- **Easy**: Obvious facts most people know
- **Medium**: Common misconceptions, interesting facts
- **Hard**: Expert-level knowledge, tricky statements

### **Question Examples**

#### **Easy**
- "The sun rises in the east." ✅ TRUE
- "Cats are nocturnal animals." ❌ FALSE (they're crepuscular)
- "Water boils at 100°C at sea level." ✅ TRUE

#### **Medium**
- "The Great Wall of China is visible from space." ❌ FALSE
- "Goldfish have a 3-second memory." ❌ FALSE
- "The human body has 206 bones." ✅ TRUE

#### **Hard**
- "The speed of light is constant in all media." ❌ FALSE
- "Sharks must keep swimming to breathe." ✅ TRUE (most species)
- "The human brain uses 20% of body energy." ✅ TRUE

---

## 🚀 **Implementation Steps**

### **Phase 1: Core Components (Week 1)**
1. Create `TrueFalseGame.tsx` component
2. Implement `trueFalseGenerator.ts` with 50+ questions
3. Add `trueFalseScoring.ts` system
4. Create basic UI layout

### **Phase 2: Game Integration (Week 2)**
1. Add True/False mode to `Play.tsx`
2. Integrate with existing game flow
3. Add to game results system
4. Test with different question sets

### **Phase 3: Polish & Features (Week 3)**
1. Add animations and transitions
2. Implement difficulty selection
3. Add category filtering
4. Create results analytics

---

## 🎯 **Integration with Existing System**

### **Play Page Integration**
```typescript
// Add to Play.tsx
const gameModes = [
  { id: 'classic', name: 'Classic Quiz', description: 'Multiple choice questions' },
  { id: 'truefalse', name: 'Fact Check', description: 'True or False statements' },
  { id: 'lightning', name: 'Lightning Round', description: 'Speed challenge' },
  // ... other modes
];
```

### **Results Integration**
- Use existing `GameOverScreen.tsx`
- Add True/False specific results display
- Integrate with ELO system
- Add to achievement system

### **Scoring Integration**
- Points contribute to XP system
- Speed bonuses add to total score
- Accuracy affects ELO rating
- Results stored in game history

---

## 📱 **Mobile Optimization**

### **Touch-Friendly Design**
- **Large buttons** (minimum 44px touch target)
- **Swipe gestures** for navigation
- **Haptic feedback** on answer selection
- **Portrait orientation** optimized

### **Responsive Layout**
- **Single column** layout on mobile
- **Large text** for readability
- **Minimal scrolling** required
- **Fast loading** times

---

## 🎉 **Why This Mode Works**

### **Easy to Implement**
- ✅ Reuses existing game infrastructure
- ✅ Simple question format (statement + boolean)
- ✅ Straightforward scoring system
- ✅ Minimal UI complexity

### **High Engagement**
- ✅ Quick decision-making (15 seconds)
- ✅ Immediate feedback
- ✅ Educational explanations
- ✅ Speed-based scoring

### **Educational Value**
- ✅ Tests knowledge retention
- ✅ Corrects misconceptions
- ✅ Provides learning explanations
- ✅ Covers diverse topics

### **Replayability**
- ✅ Large question database
- ✅ Different difficulty levels
- ✅ Category-specific games
- ✅ Speed-based leaderboards

---

## 🔮 **Future Enhancements**

### **Advanced Features**
- **Daily Fact Check** challenges
- **Category-specific** tournaments
- **User-submitted** questions
- **AI-generated** statements

### **Social Features**
- **Fact Check** leaderboards
- **Challenge friends** to fact battles
- **Share interesting** facts
- **Community question** voting

### **Analytics**
- **Knowledge gaps** identification
- **Learning progress** tracking
- **Category performance** analysis
- **Personalized** question selection

---

This True/False mode would be **perfect** for BoltQuest because it's:
- 🚀 **Easy to implement** (reuses existing systems)
- 🎯 **High engagement** (quick decisions, immediate feedback)
- 📚 **Educational** (corrects misconceptions, teaches facts)
- 🔄 **Replayable** (large database, different difficulties)

Want me to start implementing this mode? It would be a fantastic addition to your game collection! 🎮✨
