#!/bin/bash
set -euo pipefail

# Define all packages
PACKAGES=(
  "types"
  "identicon"
  "common"
  "theme"
  "api"
  "explorers"
  "portfolio"
  "notifications"
  "links"
  "dapp-connector"
  "p2p-communication"
  "exchange"
  "resolver"
  "claim"
  "setup-wallet"
  "staking"
  "swap"
  "blockchains"
  "transfer"
  "tx"
)

echo "🧹 Removing node_modules from all packages..."

# Function to remove node_modules from packages in parallel
prune_node_modules() {
  local packages=("$@")
  local pids=()
  
  for pkg in "${packages[@]}"; do
    (
      echo "  → Removing node_modules from '${pkg}'..."
      cd "packages/$pkg"
      npm prune --omit=dev
      echo "  ✅ Removed '${pkg}' node_modules"
    ) &
    pids+=($!)
  done
  
  # Wait for all removal processes to complete
  for pid in "${pids[@]}"; do
    wait "$pid"
  done
}

# Remove node_modules from all packages
prune_node_modules "${PACKAGES[@]}"

echo "✅ All node_modules removed successfully!"
