#!/bin/bash

# Migration script for consolidating useStrings hooks
# This script will update imports and usage patterns

echo "Starting useStrings migration..."

# Function to update imports
update_imports() {
    local file=$1
    local old_import=$2
    local new_import=$3
    
    echo "Updating imports in $file"
    sed -i "s|$old_import|$new_import|g" "$file"
}

# Function to update string references
update_string_refs() {
    local file=$1
    local feature=$2
    
    echo "Updating string references in $file for feature $feature"
    
    # Update common patterns
    sed -i "s/strings\./strings.$feature./g" "$file"
}

# Update Auth components
echo "=== Updating Auth components ==="
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*Auth.*useStrings" | while read file; do
    update_imports "$file" "from '~/features/Auth/hooks/useStrings'" "from '~/kernel/i18n/useStrings'"
    update_string_refs "$file" "auth"
done

# Update Exchange components
echo "=== Updating Exchange components ==="
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*Exchange.*useStrings" | while read file; do
    update_imports "$file" "from.*Exchange.*useStrings" "from '~/kernel/i18n/useStrings'"
    update_string_refs "$file" "exchange"
done

# Update Scan components
echo "=== Updating Scan components ==="
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*Scan.*useStrings" | while read file; do
    update_imports "$file" "from.*Scan.*useStrings" "from '~/kernel/i18n/useStrings'"
    update_string_refs "$file" "scan"
done

# Update WalletManager components
echo "=== Updating WalletManager components ==="
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*WalletManager.*useStrings" | while read file; do
    update_imports "$file" "from.*WalletManager.*useStrings" "from '~/kernel/i18n/useStrings'"
    update_string_refs "$file" "walletManager"
done

echo "Migration completed!"
echo "Note: Some manual adjustments may be needed for complex cases." 