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

echo "Creating src symlinks in scripts/packages/..."

for pkg in "${PACKAGES[@]}"; do
  echo "Processing package: $pkg"
  scripts_pkg_dir="scripts/packages/$pkg"
  mobile_pkg_dir="mobile/packages/$pkg"
  
  if [ -d "$scripts_pkg_dir" ] && [ -d "$mobile_pkg_dir" ]; then
    # Create relative symlink from scripts/packages/<pkg>/src to mobile/packages/<pkg>
    cd "$scripts_pkg_dir"
    ln -sf "../../../mobile/packages/$pkg" "src"
    cd - > /dev/null
    
    echo "  ✅ Created src symlink for $pkg"
  else
    echo "  ⚠️  Missing directory for $pkg"
  fi
done

echo "✅ All src symlinks created successfully!"
