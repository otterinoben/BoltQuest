# 🛠️ Scripts Directory

This directory contains utility scripts for development, testing, and maintenance of the BuzzBolt Playbook Guide.

## 📋 Available Scripts

### 🧪 Testing Scripts
- **`test-play-features.js`** - Automated testing for game features
  - Tests game mechanics, scoring, and user interactions
  - Run with: `node scripts/test-play-features.js`

### 🔄 Data Management Scripts
- **`rebalance-mockdata.js`** - Rebalances mock data for testing
  - Adjusts difficulty curves and question distributions
  - Run with: `node scripts/rebalance-mockdata.js`

### 💾 Backup Scripts
- **`auto_backup.ps1`** - PowerShell backup script for Windows
  - Creates automated backups of project files
  - Run with: `.\scripts\auto_backup.ps1`

- **`auto_backup.sh`** - Bash backup script for Unix/Linux/macOS
  - Cross-platform backup solution
  - Run with: `bash scripts/auto_backup.sh`

## 🚀 Usage Guidelines

### Prerequisites
- Node.js installed for JavaScript scripts
- PowerShell for Windows scripts
- Bash for Unix/Linux/macOS scripts

### Running Scripts
```bash
# Testing scripts
node scripts/test-play-features.js

# Data management
node scripts/rebalance-mockdata.js

# Backup scripts (Windows)
.\scripts\auto_backup.ps1

# Backup scripts (Unix/Linux/macOS)
bash scripts/auto_backup.sh
```

### Output Directories
- Script outputs are stored in `scripts/output/` (gitignored)
- Temporary files go in `scripts/temp/` (gitignored)

## 📝 Adding New Scripts

When adding new scripts:
1. Place them in this `scripts/` directory
2. Update this README with description and usage
3. Add any output directories to `.gitignore`
4. Test scripts before committing

## 🔧 Script Development

### Best Practices
- Use descriptive filenames
- Include error handling
- Add usage comments
- Test on multiple platforms when possible
- Document dependencies and requirements

### Common Patterns
```javascript
// JavaScript scripts
const fs = require('fs');
const path = require('path');

// Error handling
try {
  // Script logic
} catch (error) {
  console.error('Script failed:', error.message);
  process.exit(1);
}
```

```powershell
# PowerShell scripts
param(
  [string]$InputPath = ".",
  [string]$OutputPath = "./output"
)

# Error handling
try {
  # Script logic
} catch {
  Write-Error "Script failed: $($_.Exception.Message)"
  exit 1
}
```

## 📊 Script Categories

- **Testing** - Automated testing and validation
- **Data Management** - Data processing and manipulation
- **Backup** - File and data backup solutions
- **Build** - Build and deployment automation
- **Utilities** - General purpose helper scripts

---

*For questions about scripts, check the main project documentation or create an issue.*
