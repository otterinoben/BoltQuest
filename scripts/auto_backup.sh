#!/bin/bash

# BuzzBolt Auto-Backup Script
# Automatically backs up key project files every 30 minutes

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="buzzbolt"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create backup
create_backup() {
    local backup_name="${PROJECT_NAME}_backup_${TIMESTAMP}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    echo "🔄 Creating backup: $backup_name"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Copy key files and directories
    cp -r src/ "$backup_path/"
    cp package.json "$backup_path/"
    cp package-lock.json "$backup_path/"
    cp tsconfig.json "$backup_path/"
    cp tsconfig.app.json "$backup_path/"
    cp tsconfig.node.json "$backup_path/"
    cp tailwind.config.ts "$backup_path/"
    cp vite.config.ts "$backup_path/"
    cp index.html "$backup_path/"
    cp README.md "$backup_path/"
    
    # Copy any .md files in root
    cp *.md "$backup_path/" 2>/dev/null || true
    
    # Create backup info file
    cat > "$backup_path/BACKUP_INFO.txt" << EOF
BuzzBolt Auto-Backup
===================
Created: $(date)
Version: 1.1.0
Backup Type: Auto-save
Files Included:
- src/ (entire source directory)
- package.json
- Configuration files
- Documentation files

This backup was created automatically every 30 minutes.
EOF
    
    echo "✅ Backup created: $backup_path"
    
    # Keep only last 10 backups to save space
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    cd ..
    
    echo "🧹 Cleaned up old backups (keeping last 10)"
}

# Function to restore from backup
restore_backup() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [ ! -d "$backup_path" ]; then
        echo "❌ Backup not found: $backup_name"
        echo "Available backups:"
        ls -la "$BACKUP_DIR"
        return 1
    fi
    
    echo "🔄 Restoring from backup: $backup_name"
    
    # Create restore backup first
    local restore_backup_name="${PROJECT_NAME}_restore_backup_$(date +"%Y%m%d_%H%M%S")"
    mkdir -p "$BACKUP_DIR/$restore_backup_name"
    
    # Backup current state
    cp -r src/ "$BACKUP_DIR/$restore_backup_name/" 2>/dev/null || true
    cp package.json "$BACKUP_DIR/$restore_backup_name/" 2>/dev/null || true
    
    # Restore from backup
    cp -r "$backup_path/src/" ./
    cp "$backup_path/package.json" ./
    cp "$backup_path/package-lock.json" ./ 2>/dev/null || true
    cp "$backup_path/tsconfig.json" ./ 2>/dev/null || true
    cp "$backup_path/tsconfig.app.json" ./ 2>/dev/null || true
    cp "$backup_path/tsconfig.node.json" ./ 2>/dev/null || true
    cp "$backup_path/tailwind.config.ts" ./ 2>/dev/null || true
    cp "$backup_path/vite.config.ts" ./ 2>/dev/null || true
    cp "$backup_path/index.html" ./ 2>/dev/null || true
    cp "$backup_path/README.md" ./ 2>/dev/null || true
    
    echo "✅ Restored from backup: $backup_name"
    echo "📁 Current state backed up as: $restore_backup_name"
}

# Function to list backups
list_backups() {
    echo "📁 Available backups:"
    ls -la "$BACKUP_DIR" | grep -E "buzzbolt_backup_" | awk '{print $9, $6, $7, $8}' | column -t
}

# Function to start auto-backup daemon
start_auto_backup() {
    echo "🚀 Starting auto-backup daemon (30-minute intervals)"
    
    # Create initial backup
    create_backup
    
    # Start the daemon
    while true; do
        sleep 1800  # 30 minutes
        create_backup
    done &
    
    echo "✅ Auto-backup daemon started (PID: $!)"
    echo "💾 Backups will be created every 30 minutes"
}

# Main script logic
case "$1" in
    "backup")
        create_backup
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ Please specify backup name"
            echo "Usage: $0 restore <backup_name>"
            list_backups
            exit 1
        fi
        restore_backup "$2"
        ;;
    "list")
        list_backups
        ;;
    "start")
        start_auto_backup
        ;;
    "stop")
        pkill -f "auto_backup.sh start"
        echo "⏹️ Auto-backup daemon stopped"
        ;;
    *)
        echo "🔄 BuzzBolt Auto-Backup Script"
        echo "================================"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  backup          - Create a manual backup"
        echo "  restore <name>  - Restore from backup"
        echo "  list            - List available backups"
        echo "  start           - Start auto-backup daemon (30min intervals)"
        echo "  stop            - Stop auto-backup daemon"
        echo ""
        echo "Examples:"
        echo "  $0 backup"
        echo "  $0 restore buzzbolt_backup_20250101_120000"
        echo "  $0 list"
        echo "  $0 start"
        ;;
esac

