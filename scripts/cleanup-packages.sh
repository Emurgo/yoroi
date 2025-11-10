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

echo "Removing node_modules from package directories..."

for pkg in "${PACKAGES[@]}"; do
  echo "Processing package: $pkg"
  pkg_dir="packages/$pkg"
  node_modules_path="$pkg_dir/node_modules"
  
  if [ -d "$node_modules_path" ]; then
    echo "  Removing node_modules from $pkg..."
    rm -rf "$node_modules_path"
    echo "  ✅ Removed node_modules from $pkg"
  else
    echo "  ⚠️  No node_modules found in $pkg"
  fi
done

echo "✅ All node_modules folders removed successfully!"

