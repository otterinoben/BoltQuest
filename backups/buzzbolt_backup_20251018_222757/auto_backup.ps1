# BuzzBolt Auto-Backup Script (PowerShell)
# Automatically backs up key project files every 30 minutes

param(
    [string]$Action = "help"
)

# Configuration
$BackupDir = "backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ProjectName = "buzzbolt"

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Function to create backup
function Create-Backup {
    $BackupName = "${ProjectName}_backup_${Timestamp}"
    $BackupPath = Join-Path $BackupDir $BackupName
    
    Write-Host "🔄 Creating backup: $BackupName" -ForegroundColor Cyan
    
    # Create backup directory
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
    
    # Copy key files and directories
    Copy-Item -Path "src" -Destination $BackupPath -Recurse -Force
    Copy-Item -Path "package.json" -Destination $BackupPath -Force
    Copy-Item -Path "package-lock.json" -Destination $BackupPath -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "tsconfig.json" -Destination $BackupPath -Force
    Copy-Item -Path "tsconfig.app.json" -Destination $BackupPath -Force
    Copy-Item -Path "tsconfig.node.json" -Destination $BackupPath -Force
    Copy-Item -Path "tailwind.config.ts" -Destination $BackupPath -Force
    Copy-Item -Path "vite.config.ts" -Destination $BackupPath -Force
    Copy-Item -Path "index.html" -Destination $BackupPath -Force
    Copy-Item -Path "README.md" -Destination $BackupPath -Force -ErrorAction SilentlyContinue
    
    # Copy any .md files in root
    Get-ChildItem -Path "." -Filter "*.md" | Copy-Item -Destination $BackupPath -Force
    
    # Create backup info file
    $BackupInfo = @"
BuzzBolt Auto-Backup
===================
Created: $(Get-Date)
Version: 1.1.0
Backup Type: Auto-save
Files Included:
- src/ (entire source directory)
- package.json
- Configuration files
- Documentation files

This backup was created automatically every 30 minutes.
"@
    
    $BackupInfo | Out-File -FilePath (Join-Path $BackupPath "BACKUP_INFO.txt") -Encoding UTF8
    
    Write-Host "✅ Backup created: $BackupPath" -ForegroundColor Green
    
    # Keep only last 10 backups to save space
    $Backups = Get-ChildItem -Path $BackupDir | Sort-Object CreationTime -Descending
    if ($Backups.Count -gt 10) {
        $Backups | Select-Object -Skip 10 | Remove-Item -Recurse -Force
        Write-Host "🧹 Cleaned up old backups (keeping last 10)" -ForegroundColor Yellow
    }
}

# Function to restore from backup
function Restore-Backup {
    param([string]$BackupName)
    
    $BackupPath = Join-Path $BackupDir $BackupName
    
    if (!(Test-Path $BackupPath)) {
        Write-Host "❌ Backup not found: $BackupName" -ForegroundColor Red
        Write-Host "Available backups:" -ForegroundColor Yellow
        Get-ChildItem -Path $BackupDir | Format-Table Name, CreationTime
        return
    }
    
    Write-Host "🔄 Restoring from backup: $BackupName" -ForegroundColor Cyan
    
    # Create restore backup first
    $RestoreBackupName = "${ProjectName}_restore_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    $RestoreBackupPath = Join-Path $BackupDir $RestoreBackupName
    New-Item -ItemType Directory -Path $RestoreBackupPath | Out-Null
    
    # Backup current state
    if (Test-Path "src") { Copy-Item -Path "src" -Destination $RestoreBackupPath -Recurse -Force }
    if (Test-Path "package.json") { Copy-Item -Path "package.json" -Destination $RestoreBackupPath -Force }
    
    # Restore from backup
    Copy-Item -Path (Join-Path $BackupPath "src") -Destination "." -Recurse -Force
    Copy-Item -Path (Join-Path $BackupPath "package.json") -Destination "." -Force
    Copy-Item -Path (Join-Path $BackupPath "package-lock.json") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "tsconfig.json") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "tsconfig.app.json") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "tsconfig.node.json") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "tailwind.config.ts") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "vite.config.ts") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "index.html") -Destination "." -Force -ErrorAction SilentlyContinue
    Copy-Item -Path (Join-Path $BackupPath "README.md") -Destination "." -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Restored from backup: $BackupName" -ForegroundColor Green
    Write-Host "📁 Current state backed up as: $RestoreBackupName" -ForegroundColor Yellow
}

# Function to list backups
function List-Backups {
    Write-Host "📁 Available backups:" -ForegroundColor Cyan
    Get-ChildItem -Path $BackupDir | Where-Object { $_.Name -like "${ProjectName}_backup_*" } | 
        Format-Table Name, CreationTime, @{Name="Size"; Expression={"{0:N2} MB" -f ((Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)}} -AutoSize
}

# Function to start auto-backup daemon
function Start-AutoBackup {
    Write-Host "🚀 Starting auto-backup daemon (30-minute intervals)" -ForegroundColor Cyan
    
    # Create initial backup
    Create-Backup
    
    # Start the daemon
    $Job = Start-Job -ScriptBlock {
        while ($true) {
            Start-Sleep -Seconds 1800  # 30 minutes
            & $using:PSCommandPath "backup"
        }
    }
    
    Write-Host "✅ Auto-backup daemon started (Job ID: $($Job.Id))" -ForegroundColor Green
    Write-Host "💾 Backups will be created every 30 minutes" -ForegroundColor Yellow
    Write-Host "Use 'Stop-Job $($Job.Id)' to stop the daemon" -ForegroundColor Gray
}

# Main script logic
switch ($Action.ToLower()) {
    "backup" {
        Create-Backup
    }
    "restore" {
        if ($args.Count -eq 0) {
            Write-Host "❌ Please specify backup name" -ForegroundColor Red
            Write-Host "Usage: .\auto_backup.ps1 restore <backup_name>" -ForegroundColor Yellow
            List-Backups
            exit 1
        }
        Restore-Backup $args[0]
    }
    "list" {
        List-Backups
    }
    "start" {
        Start-AutoBackup
    }
    "stop" {
        Get-Job | Where-Object { $_.Command -like "*auto_backup*" } | Stop-Job
        Write-Host "⏹️ Auto-backup daemon stopped" -ForegroundColor Yellow
    }
    default {
        Write-Host "🔄 BuzzBolt Auto-Backup Script (PowerShell)" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\auto_backup.ps1 <command>" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  backup          - Create a manual backup" -ForegroundColor Gray
        Write-Host "  restore <name>  - Restore from backup" -ForegroundColor Gray
        Write-Host "  list            - List available backups" -ForegroundColor Gray
        Write-Host "  start           - Start auto-backup daemon (30min intervals)" -ForegroundColor Gray
        Write-Host "  stop            - Stop auto-backup daemon" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor White
        Write-Host "  .\auto_backup.ps1 backup" -ForegroundColor Gray
        Write-Host "  .\auto_backup.ps1 restore buzzbolt_backup_20250101_120000" -ForegroundColor Gray
        Write-Host "  .\auto_backup.ps1 list" -ForegroundColor Gray
        Write-Host "  .\auto_backup.ps1 start" -ForegroundColor Gray
    }
}

