# 🧪 BuzzBolt Testing Tool

## Overview
A comprehensive testing panel that follows you around the site, allowing you to test all game features quickly and easily. Perfect for development, debugging, and testing!

## 🚀 Features

### **Quick Actions**
- **Time Control**: Add/remove seconds from timer
- **Score Control**: Add/remove points from score
- **Coin Control**: Add coins (for future coin system)

### **Popup Testing**
- **Penalty Animations**: Test +5s, -3s penalty popups
- **Streak Popups**: Test milestone and PB streak celebrations
- **Visual Feedback**: All popups show with proper animations and sounds

### **Game Controls**
- **Pause Toggle**: Test pause/unpause functionality
- **Real-time Stats**: Live display of score, time, and combo

### **Data Management**
- **Export Data**: Download all game data as JSON
- **Import Data**: Upload and restore game data
- **Reset All Data**: Clear all localStorage data

### **Testing Modes**
- **Auto Test Mode**: Automated testing (future feature)
- **Sound Test Mode**: Audio testing (future feature)

## 🎮 How to Use

### **Opening the Panel**
- **Click** the purple settings button (bottom-right corner)
- **Keyboard**: `Ctrl + Shift + T` to toggle panel visibility

### **Expanding/Collapsing**
- **Click** the chevron up/down button
- **Keyboard**: `Ctrl + Shift + E` to expand/collapse

### **Quick Actions**
1. **Enter a value** in the input field
2. **Click Add** to increase the value
3. **Click Remove** to decrease the value
4. **See instant feedback** with animations and sounds

### **Popup Testing**
- **Click any popup button** to test animations
- **+5s/-3s**: Test penalty animations
- **Streak/PB**: Test celebration popups

### **Data Management**
- **Export**: Downloads current game data
- **Import**: Uploads and restores game data
- **Reset**: Clears all data (with confirmation)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + T` | Toggle testing panel |
| `Ctrl + Shift + E` | Expand/collapse panel |
| `Space` | Pause/unpause game |
| `S` | Skip question |
| `1-4` | Answer questions |
| `Escape` | Quit game |

## 🎯 Testing Scenarios

### **Basic Game Testing**
1. **Start a game** on `/play`
2. **Open testing panel** (`Ctrl + Shift + T`)
3. **Add time** to test timer functionality
4. **Add score** to test scoring system
5. **Test popups** to verify animations

### **Pause System Testing**
1. **Start a game**
2. **Click Pause Toggle** in testing panel
3. **Verify countdown** appears
4. **Test spacebar** pause/unpause
5. **Test left-click** unpause

### **Data Management Testing**
1. **Play some games** to generate data
2. **Export data** to save current state
3. **Reset all data** to clear everything
4. **Import data** to restore previous state

### **Popup Animation Testing**
1. **Click penalty buttons** (+5s, -3s)
2. **Verify animations** appear correctly
3. **Check sounds** play appropriately
4. **Test streak popups** for celebrations

## 🔧 Technical Details

### **Files Created**
- `src/components/TestingPanel.tsx` - Main testing panel component
- `src/contexts/TestingContext.tsx` - Global testing context
- Updated `src/App.tsx` - Integrated testing provider
- Updated `src/pages/Game.tsx` - Connected testing functions

### **Integration Points**
- **Game State**: Connected to actual game state in Game.tsx
- **Animations**: Uses existing penalty and streak popup systems
- **Sounds**: Integrates with audio context
- **Data**: Works with localStorage for persistence

### **Accessibility Features**
- **High contrast** colors (black background, white text)
- **Large buttons** (minimum 44px touch targets)
- **Keyboard shortcuts** for all major functions
- **Clear visual feedback** for all actions
- **Confirmation dialogs** for destructive actions

## 🎨 Design Philosophy

### **User-Friendly**
- **Simple interface** - no complex menus
- **Clear labels** - every button has an icon + text
- **Instant feedback** - all actions show immediate results
- **Error prevention** - confirmations for destructive actions

### **Developer-Friendly**
- **Persistent state** - remembers visibility preferences
- **Global access** - works on any page
- **Real-time stats** - live game state display
- **Comprehensive testing** - covers all major features

### **Blind-Friendly**
- **High contrast** - black background, white text, bright accents
- **Large targets** - easy to click even with poor vision
- **Clear feedback** - visual and audio confirmation
- **Keyboard accessible** - full keyboard navigation

## 🚀 Future Enhancements

### **Planned Features**
- **Auto Test Mode**: Automated testing sequences
- **Performance Monitoring**: FPS, memory usage tracking
- **Bulk Operations**: Mass data generation
- **Test Scenarios**: Predefined testing workflows
- **Analytics Testing**: Test analytics tracking

### **Advanced Features**
- **Multi-user Simulation**: Test multiplayer features
- **Load Testing**: Stress test the application
- **Accessibility Testing**: Automated a11y checks
- **Cross-browser Testing**: Test in different browsers

---

## 🎯 Quick Start

1. **Open the app** and navigate to any page
2. **Press `Ctrl + Shift + T`** to open testing panel
3. **Click the purple settings button** if keyboard shortcut doesn't work
4. **Start testing!** Use the quick actions to manipulate game state
5. **Test popups** with the popup testing buttons
6. **Manage data** with export/import/reset functions

**Happy Testing!** 🧪✨

