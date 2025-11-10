#!/bin/bash
set -euo pipefail

# List of all packages
PACKAGES=(
  "api"
  "blockchains"
  "claim"
  "common"
  "dapp-connector"
  "exchange"
  "explorers"
  "identicon"
  "links"
  "notifications"
  "p2p-communication"
  "portfolio"
  "resolver"
  "setup-wallet"
  "staking"
  "swap"
  "theme"
  "transfer"
  "tx"
  "types"
)

# Configuration files to move (excluding code files)
CONFIG_FILES=(
  "_package.json"
  ".eslintrc.json"
  ".eslintignore"
  ".prettierrc"
  ".gitignore"
  "babel.config.js"
  "bob.config.js"
  "commitlint.config.js"
  "jest.config.js"
  "jest.setup.js"
  "tsconfig.json"
  "tsconfig.build.json"
  ".dependency-cruiser.js"
  ".release-it.json"
  "README.md"
  "scripts"
)

echo "Moving package configuration files to scripts/packages/..."

for pkg in "${PACKAGES[@]}"; do
  echo "Processing package: $pkg"
  
  # Skip types as it's already done
  if [ "$pkg" = "types" ]; then
    echo "  Skipping types (already processed)"
    continue
  fi
  
  for file in "${CONFIG_FILES[@]}"; do
  source_path="apps/mobile/packages/$pkg/$file"
  dest_path="scripts/packages/$pkg/$file"
  
  # Rename _package.json to package.json in destination
  if [ "$file" = "_package.json" ]; then
    dest_path="scripts/packages/$pkg/package.json"
  fi
  
  if [ -f "$source_path" ]; then
    echo "  Moving $file"
    git mv "$source_path" "$dest_path"
  elif [ -d "$source_path" ]; then
    echo "  Moving $file directory"
    git mv "$source_path" "$dest_path"
  fi
done
done

echo "✅ All package configuration files moved successfully!"
