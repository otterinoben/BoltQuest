# 🎮 BoltQuest Play Page - Manual Testing Guide

## 🚀 Quick Start Testing

### Test 1: Quick Start Section
1. **Navigate to `/play`**
2. **Verify Quick Start Card appears** with:
   - "Quick Start" title
   - "Jump right in with recommended settings" description
   - Category selection buttons (Technology, Business, Marketing, Finance, General)
   - Difficulty selection buttons (Easy, Medium, Hard)
   - "Start Playing Now" button (large, prominent)
   - "Customize Game" button

### Test 2: Category Selection
1. **Click different category buttons**
2. **Verify visual feedback**:
   - Selected button has primary border and background
   - Question counts display correctly
   - Icons appear for each category

### Test 3: Difficulty Selection
1. **Click different difficulty buttons**
2. **Verify visual feedback**:
   - Selected button has primary border and background
   - Time estimates display correctly
   - Color-coded difficulty indicators

### Test 4: Quick Start Button
1. **Click "Start Playing Now"**
2. **Verify navigation** to game page with selected settings

## 🧙 Wizard Interface Testing

### Test 5: Wizard Trigger
1. **Click "Customize Game" button**
2. **Verify wizard opens** with Step 1: Choose Game Mode

### Test 6: Mode Selection
1. **Verify two mode cards appear**:
   - Quick Play (with scoring details)
   - Training Mode (with learning details)
2. **Click Quick Play**
3. **Verify visual selection feedback**
4. **Click Next button**

### Test 7: Category Selection (Wizard)
1. **Verify Step 2: Select Category**
2. **Click different categories**
3. **Verify question counts and success rates display**
4. **Click Next button**

### Test 8: Difficulty Selection (Wizard)
1. **Verify Step 3: Choose Difficulty**
2. **Click different difficulties**
3. **Verify time estimates and success rates display**
4. **Click Next button**

### Test 9: Timer Selection (Wizard)
1. **Verify Step 4: Set Timer** (only for Quick Play)
2. **Click different timer options**:
   - 30s (Quick Challenge)
   - 45s (Balanced)
   - 60s (Extended Play)
3. **Verify detailed gameplay impact explanations**
4. **Click "Start Game" button**

### Test 10: Wizard Navigation
1. **Test Previous button** (should go back through steps)
2. **Test Skip to Advanced button** (should show advanced config)
3. **Verify step indicators work correctly**

## ⭐ Favorites System Testing

### Test 11: Add to Favorites
1. **Scroll to "Save Current Configuration" section**
2. **Click "Add to Favorites" button**
3. **Enter a name** (e.g., "My Tech Challenge")
4. **Verify success toast appears**
5. **Verify favorite appears in "Your Favorites" section**

### Test 12: Favorites Management
1. **Verify favorite card displays**:
   - Custom name
   - Category and difficulty icons
   - Mode and timer settings
   - Creation date
   - "Play This Config" button
2. **Hover over favorite card**
3. **Verify X button appears** for removal
4. **Click X button to remove favorite**

### Test 13: Play from Favorites
1. **Click "Play This Config" button**
2. **Verify navigation** to game with saved settings

## 🕒 Recent Selections Testing

### Test 14: Recent Selections Display
1. **Play a few games** (go to `/game` and complete them)
2. **Return to `/play`**
3. **Verify "Recent Selections" section appears**
4. **Verify last 3 games display** with:
   - Category and difficulty indicators
   - Mode, timer, score, and accuracy
   - Date played
   - "Click to replay →" indicator

### Test 15: Replay from Recent
1. **Click on a recent selection card**
2. **Verify settings are applied** and game starts

## 🎯 Smart Recommendations Testing

### Test 16: Recommendations Display
1. **Play several games with different categories**
2. **Return to `/play`**
3. **Verify "Smart Recommendations" section appears**
4. **Verify recommendation cards show**:
   - Recommendation type (Practice/Challenge/Explore)
   - Personalized description
   - Category and difficulty
   - "Try This Recommendation" button

### Test 17: Recommendation Types
1. **Verify different recommendation types**:
   - "Improve Your Weakest Area" (for low accuracy)
   - "Challenge Yourself" (for high accuracy)
   - "Explore Your Interests" (based on profile)

## 📱 Mobile Optimization Testing

### Test 18: Mobile Layout
1. **Open browser dev tools**
2. **Switch to mobile viewport** (375px width)
3. **Verify responsive layout**:
   - Cards stack vertically
   - Buttons maintain 44px+ touch targets
   - Text remains readable
   - No horizontal scrolling

### Test 19: Touch Interactions
1. **Test touch interactions** on mobile:
   - Category selection buttons
   - Difficulty selection buttons
   - Main action buttons
   - Wizard navigation
2. **Verify all buttons are easily tappable**

## ♿ Accessibility Testing

### Test 20: Keyboard Navigation
1. **Use Tab key to navigate** through all interactive elements
2. **Verify focus indicators** are visible
3. **Use Enter/Space to activate** buttons
4. **Verify all functionality works** with keyboard only

### Test 21: Screen Reader Support
1. **Enable screen reader** (if available)
2. **Navigate through the page**
3. **Verify all content is announced** properly
4. **Verify button purposes are clear**

### Test 22: Color Contrast
1. **Verify sufficient color contrast**:
   - Text is readable against backgrounds
   - Button text is clear
   - Status indicators are distinguishable

## 🛡️ Error Handling Testing

### Test 23: Data Loading Errors
1. **Clear localStorage** in dev tools
2. **Refresh the page**
3. **Verify page loads gracefully** without errors
4. **Verify fallback values** are used

### Test 24: Invalid Data Handling
1. **Manually corrupt localStorage** data
2. **Refresh the page**
3. **Verify error handling** prevents crashes

## ⚡ Performance Testing

### Test 25: Loading Performance
1. **Open Network tab** in dev tools
2. **Navigate to `/play`**
3. **Verify page loads quickly** (< 2 seconds)
4. **Verify no unnecessary requests**

### Test 26: Interaction Performance
1. **Rapidly click buttons** and navigate
2. **Verify smooth animations** and transitions
3. **Verify no lag** or stuttering

## 🎯 Edge Cases Testing

### Test 27: Empty States
1. **Clear all data** (localStorage)
2. **Verify empty states** display properly:
   - No recent selections message
   - No favorites message
   - Default recommendations

### Test 28: Large Data Sets
1. **Create many favorites** (10+)
2. **Play many games** (20+)
3. **Verify performance** remains good
4. **Verify UI doesn't break**

## 📊 Test Results Checklist

- [ ] Quick Start section works
- [ ] Category selection works
- [ ] Difficulty selection works
- [ ] Quick Start button works
- [ ] Wizard opens correctly
- [ ] Mode selection works
- [ ] Wizard navigation works
- [ ] Timer selection works
- [ ] Favorites system works
- [ ] Recent selections work
- [ ] Recommendations work
- [ ] Mobile layout works
- [ ] Accessibility works
- [ ] Error handling works
- [ ] Performance is good

## 🐛 Common Issues to Check

1. **White screen errors** - Check console for JavaScript errors
2. **Button not responding** - Verify click handlers are attached
3. **Data not persisting** - Check localStorage functionality
4. **Layout breaking** - Test different screen sizes
5. **Slow performance** - Check for memory leaks or heavy operations

## 📝 Reporting Issues

When reporting issues, include:
- **Browser and version**
- **Screen size/viewport**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Screenshots** (if helpful)

---

**Happy Testing! 🎮✨**


