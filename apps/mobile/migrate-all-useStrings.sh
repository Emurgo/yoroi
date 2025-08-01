#!/bin/bash

# Comprehensive migration script for all useStrings hooks
echo "Starting comprehensive useStrings migration..."

# Function to update imports and string references
migrate_feature() {
    local feature=$1
    local feature_path=$2
    local namespace=$3
    
    echo "=== Migrating $feature ==="
    
    # Find all files that import from this feature's useStrings
    find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*$feature_path.*useStrings" | while read file; do
        echo "Updating imports in $file"
        
        # Update import
        sed -i "s|from.*$feature_path.*useStrings|from '~/kernel/i18n/useStrings'|g" "$file"
        
        # Update string references (basic pattern)
        sed -i "s/strings\./strings.$namespace./g" "$file"
        
        echo "  ✓ Updated $file"
    done
}

# Migrate all remaining features
migrate_feature "Portfolio" "Portfolio/common/hooks" "portfolio"
migrate_feature "ReviewTx" "ReviewTx/common/hooks" "reviewTx"
migrate_feature "Discover" "Discover/common" "discover"
migrate_feature "Claim" "Claim/common" "claim"
migrate_feature "Notifications" "Notifications/common" "notifications"
migrate_feature "Links" "Links/common" "links"
migrate_feature "SetupWallet" "SetupWallet/common" "setupWallet"
migrate_feature "Receive" "Receive/common" "receive"
migrate_feature "Settings" "Settings/useCases/changeWalletSettings/ManageNotifications" "settings"

echo "Migration completed!"
echo "Note: Some manual adjustments may be needed for complex cases." 