# 🧪 Testing Chat Commands Guide

## ✅ **ESSENTIAL COMMANDS NOW WORKING**

### **🔄 Reset Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/reset-all` | Reset all user data (level, XP, coins, points, streak, achievements, ELO) | `/reset-all` | ✅ **FIXED** |
| `/reset-level` | Reset to level 1 | `/reset-level` | ✅ Working |
| `/reset-currency` | Reset all currency to 0 | `/reset-currency` | ✅ Working |
| `/elo-reset` | Reset ELO rating for category | `/elo-reset tech` | ✅ **FIXED** |
| `/elo-reset-all` | Reset all ELO ratings | `/elo-reset-all` | ✅ **FIXED** |
| `/achievement-reset` | Reset specific achievement | `/achievement-reset first_score` | ✅ Working |
| `/achievement-reset-all` | Reset all achievements | `/achievement-reset-all` | ✅ Working |
| `/daily-reset` | Reset daily tasks | `/daily-reset` | ✅ Working |

### **📊 Level & XP Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/level` | Set level (1-200) | `/level 50` | ✅ Working |
| `/xp` | Add XP points | `/xp 1000` | ✅ Working |
| `/fix-profile` | Fix profile data mismatch | `/fix-profile` | ✅ Working |

### **💰 Currency Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/coins` | Add coins | `/coins 5000` | ✅ Working |
| `/points` | Add points | `/points 1000` | ✅ Working |

### **🏆 Achievement Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/achievement-unlock` | Unlock specific achievement | `/achievement-unlock first_score` | ✅ Working |
| `/achievement-unlock-all` | Unlock all achievements | `/achievement-unlock-all` | ✅ Working |

### **🎯 ELO Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/elo-set` | Set ELO rating for category | `/elo-set tech 1500` | ✅ Working |
| `/elo-simulate` | Simulate ELO games | `/elo-simulate 10` | ✅ Working |

### **🎮 Game Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/game-simulate` | Simulate game with score | `/game-simulate classic 850` | ✅ Working |
| `/daily-complete-all` | Complete all daily tasks | `/daily-complete-all` | ✅ Working |

### **🔧 System Commands**
| Command | Description | Example | Status |
|---------|-------------|---------|--------|
| `/help` | Show help information | `/help` | ✅ Working |
| `/commands` | List all commands | `/commands` | ✅ Working |
| `/system-health` | Check system status | `/system-health` | ✅ Working |
| `/backup-data` | Backup current data | `/backup-data` | ✅ Working |
| `/restore-data` | Restore backed up data | `/restore-data` | ✅ Working |

## 🚀 **Quick Command Buttons**

The testing chat now includes these quick action buttons:
- **/help** - Show help
- **/level 10** - Quick level test
- **/coins 1k** - Quick coin test  
- **/reset-all** - Reset everything (RED BUTTON)
- **/health** - System health check

## 🎯 **Most Used Commands**

### **For Testing New Features:**
```bash
/reset-all          # Start fresh
/level 50           # Set test level
/coins 10000        # Give test coins
/achievement-unlock-all  # Unlock all achievements
```

### **For Testing Progression:**
```bash
/level 1            # Start from beginning
/xp 1000            # Add XP
/level 10           # Jump to milestone
/level 50           # Test mid-game
/level 200          # Test endgame
```

### **For Testing Currency:**
```bash
/reset-currency     # Reset coins/points
/coins 5000         # Add coins
/points 1000        # Add points
```

### **For Testing ELO:**
```bash
/elo-reset-all      # Reset all ratings
/elo-set tech 1500  # Set specific rating
/elo-simulate 5     # Simulate games
```

## 🔧 **What Was Fixed**

### **❌ Before (Broken):**
- `/reset-all` - Only showed message, didn't reset data
- `/elo-reset` - Only showed message, didn't reset ELO
- `/elo-reset-all` - Only showed message, didn't reset ELO
- Missing reset methods in ELO system

### **✅ After (Fixed):**
- `/reset-all` - Actually resets ALL user data
- `/elo-reset` - Actually resets ELO ratings
- `/elo-reset-all` - Actually resets all ELO ratings
- Added proper reset methods to ELO system
- Added toast notifications for successful resets
- Added better error handling

## 🎮 **Testing Workflow**

1. **Start Fresh:** `/reset-all`
2. **Test Leveling:** `/level 10`, `/level 50`, `/level 100`
3. **Test Currency:** `/coins 5000`, `/points 1000`
4. **Test Achievements:** `/achievement-unlock-all`
5. **Test ELO:** `/elo-set tech 1500`
6. **Test Games:** `/game-simulate classic 850`
7. **Check Health:** `/system-health`

## 🚨 **Important Notes**

- **Reset commands are DESTRUCTIVE** - they permanently delete data
- **Always backup** before major resets using `/backup-data`
- **Use `/fix-profile`** if you see level/XP mismatches
- **Toast notifications** will show success/failure for all commands
- **All commands now have proper error handling**

## 🎯 **Next Steps**

All essential testing commands are now working! You can:
- Test the new balanced XP system
- Reset data for clean testing
- Simulate different game scenarios
- Verify all progression systems

**Try `/reset-all` followed by `/level 10` to test the new balanced progression!** 🚀
