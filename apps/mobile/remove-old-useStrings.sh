#!/bin/bash

# Script to remove old individual useStrings files
echo "Removing old individual useStrings files..."

# List of files to remove
files_to_remove=(
  "./src/features/Auth/hooks/useStrings.ts"
  "./src/features/Scan/common/useStrings.tsx"
  "./src/features/SetupWallet/common/useStrings.tsx"
  "./src/features/Claim/common/useStrings.tsx"
  "./src/features/Notifications/common/useStrings.tsx"
  "./src/features/Links/common/useStrings.ts"
  "./src/features/Portfolio/common/hooks/useStrings.tsx"
  "./src/features/ReviewTx/common/hooks/useStrings.tsx"
  "./src/features/Discover/common/useStrings.tsx"
  "./src/features/Exchange/common/useStrings.tsx"
  "./src/features/Settings/useCases/changeWalletSettings/ManageNotifications/useStrings.ts"
  "./src/features/Receive/common/useStrings.tsx"
  "./src/features/WalletManager/hooks/useStrings.ts"
  "./src/ui/Boundary/useStrings.ts"
)

# Remove each file
for file in "${files_to_remove[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing $file"
    rm "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Old useStrings files removed!"
echo "Note: Make sure all components are using the consolidated hook before removing these files." 