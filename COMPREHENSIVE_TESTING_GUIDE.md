# 🧪 Comprehensive Testing Tool Guide

## Overview
The comprehensive testing tool is a powerful admin panel that allows you to test all features of the BuzzBolt application. It includes both visual buttons and chat commands for maximum flexibility.

## 🚀 Quick Start

### Opening the Testing Panel
- **Keyboard Shortcut**: Press `Tab + `` (backtick) to open with chat focused
- **Alternative**: Press `Ctrl+Shift+T` to toggle the panel
- **Manual**: Click the purple settings button in the bottom-right corner

### Panel Controls
- **Expand/Collapse**: `Ctrl+Shift+E` or click the chevron icon
- **Reset Position**: `Ctrl+Shift+R` or click the reset icon
- **Hide Panel**: Click the eye-off icon

## 🎯 Testing Sections

### 1. Quick Actions
Always visible section with essential controls:
- **Time Control**: Add/remove time from games
- **Score Control**: Add/remove points
- **Baseline Assessment**: Test the assessment system

### 2. Testing Chat
Interactive command interface with:
- **Auto-complete**: Type `/` and see suggestions
- **Command History**: Previous commands are saved
- **Real-time Feedback**: Instant success/error messages

### 3. Stats Management
Comprehensive user data manipulation:
- **Presets**: Beginner, Intermediate, Advanced, Extreme
- **Individual Controls**: XP, Coins, Streak, Level, Points
- **Real-time Updates**: Changes reflect immediately

### 4. Shop Testing
E-commerce system testing:
- **Coin Management**: Add/spend coins
- **Item Purchases**: Test buying items
- **Inventory Display**: View owned items
- **Reset Functions**: Clear all owned items

### 5. ELO Ranking System
Advanced ranking system testing:
- **Rank Testing**: Test different ELO ratings
- **Division Testing**: Set specific divisions (Gold III, Silver I, etc.)
- **ELO Reset**: Clear all ELO data
- **Progress Tracking**: View rank progression

### 6. User Data Context
Centralized data management:
- **Context Refresh**: Force data reload
- **Status Check**: Verify all data sources
- **Debug Info**: Detailed system state
- **Context Reset**: Clear all user data

### 7. Match History
Game history management:
- **Add Test Games**: Generate sample games
- **View Statistics**: Average scores, accuracy, etc.
- **Export Data**: Download history as JSON
- **Clear History**: Remove all games

### 8. Smart Notifications
Notification system testing:
- **Test Notifications**: Send sample notifications
- **Generate Smart**: AI-powered suggestions
- **Clear All**: Remove all notifications
- **Settings**: View notification preferences

### 9. Comprehensive Testing
Full system validation:
- **Run All Tests**: Complete system check
- **Individual Modules**: Test specific components
- **Quick Scenarios**: Set up different user types
- **Reset Everything**: Clean slate for testing

## 💬 Chat Commands

### Testing Commands
```
/test all              # Run all tests
/test dashboard        # Test dashboard functionality
/test elo             # Test ELO ranking system
/test daily           # Test daily tasks
/test data            # Test data flow
```

### Context Commands
```
/context refresh      # Refresh user data context
/context status       # Check system status
/context debug        # Get detailed debug info
/context reset        # Reset all user data
```

### History Commands
```
/history add          # Add test game to history
/history clear        # Clear game history
/history stats        # View game statistics
/history export       # Export history to JSON
```

### Notification Commands
```
/notify test          # Send test notification
/notify generate      # Generate smart notification
/notify clear         # Clear all notifications
/notify settings      # View notification settings
```

### Scenario Commands
```
/scenario newuser     # Set up new user state
/scenario poweruser   # Set up power user state
/scenario casual      # Set up casual user state
/scenario reset       # Reset all scenarios
```

### ELO Testing Commands
```
/elo-test 1200        # Test ELO with specific rating
/elo-division "Gold III"  # Set specific division
/elo-reset            # Reset ELO data
```

## 🎮 Testing Scenarios

### New User Testing
1. Run `/scenario newuser`
2. Check dashboard displays correctly
3. Test daily tasks generation
4. Verify ELO starts at default rating

### Power User Testing
1. Run `/scenario poweruser`
2. Check high-level displays
3. Test advanced features
4. Verify ELO progression

### Casual User Testing
1. Run `/scenario casual`
2. Check mid-level features
3. Test moderate progression
4. Verify balanced experience

### System Health Check
1. Run `/test all`
2. Check all components pass
3. Review any error messages
4. Fix issues as needed

## 🔧 Troubleshooting

### Common Issues
- **Commands not working**: Check if panel is expanded and chat is focused
- **Data not updating**: Try `/context refresh`
- **Panel not responding**: Try `Ctrl+Shift+R` to reset position
- **Commands not recognized**: Check spelling and use `/help` for available commands

### Debug Steps
1. Run `/context debug` to see system state
2. Check browser console for errors
3. Try `/test all` to identify failing components
4. Use `/scenario reset` to start fresh

## 📊 Best Practices

### Before Testing
1. Always backup data with `/backup-data`
2. Set up appropriate scenario
3. Clear any existing test data

### During Testing
1. Use specific test scenarios
2. Document any issues found
3. Test both success and failure cases

### After Testing
1. Reset to clean state
2. Verify all systems working
3. Document test results

## 🎯 Quick Reference

| Action | Command | Button |
|--------|---------|--------|
| Run all tests | `/test all` | "Run All Tests" |
| Test dashboard | `/test dashboard` | "Test Dashboard" |
| Add test game | `/history add` | "Add Test Game" |
| Test notifications | `/notify test` | "Test Notification" |
| Set new user | `/scenario newuser` | "New User" |
| Check status | `/context status` | "Check Status" |

## 🚀 Advanced Features

### Custom Test Data
- Use `/history add` with specific parameters
- Set custom ELO ratings with `/elo-test`
- Generate specific scenarios

### Data Export
- Export game history with `/history export`
- Backup all data with `/backup-data`
- Export specific test results

### Integration Testing
- Test data flow between components
- Verify real-time updates
- Check error handling

---

**The comprehensive testing tool is now fully functional and ready for thorough testing of all BuzzBolt features!** 🎯
