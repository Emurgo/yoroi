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

echo "Moving src/ contents up one level in package directories..."

for pkg in "${PACKAGES[@]}"; do
  echo "Processing package: $pkg"
  pkg_dir="apps/mobile/packages/$pkg"
  src_dir="$pkg_dir/src"
  
  if [ -d "$src_dir" ]; then
    echo "  Moving contents from src/ to package root"
    
    # Move all contents from src/ to the package root using git mv
    if [ "$(ls -A "$src_dir")" ]; then
      for item in "$src_dir"/*; do
        if [ -e "$item" ]; then
          git mv "$item" "$pkg_dir/"
        fi
      done
    fi
    
    # Remove the now-empty src directory
    rmdir "$src_dir"
    
    echo "  ✅ Moved $pkg src contents"
  else
    echo "  ⚠️  No src directory found for $pkg"
  fi
done

echo "✅ All src/ contents moved successfully!"
