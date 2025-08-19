#!/bin/bash
set -euo pipefail

# Parse command line arguments
CLEAN_MODE=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--clean]"
      exit 1
      ;;
  esac
done

# Define packages grouped by dependency levels
# Level 0: No internal dependencies
LEVEL_0=("types" "identicon")

# Level 1: Depends on Level 0
LEVEL_1=("common")

# Level 2: Depends on Level 1
LEVEL_2=("theme" "api" "explorers" "portfolio" "notifications" "links" "dapp-connector")

# Level 3: Depends on Level 2
LEVEL_3=("exchange" "resolver" "claim" "setup-wallet")

# Level 4: Depends on Level 2 & 3
LEVEL_4=("staking" "swap")

# Level 5: Depends on Level 2, 3 & 4
LEVEL_5=("blockchains" "transfer")

# All levels combined for cleanup
ALL_LEVELS=("${LEVEL_0[@]}" "${LEVEL_1[@]}" "${LEVEL_2[@]}" "${LEVEL_3[@]}" "${LEVEL_4[@]}" "${LEVEL_5[@]}")

echo "🧹 Cleaning all packages..."

# Clean all packages in parallel
clean_packages() {
  local packages=("$@")
  local pids=()
  
  for pkg in "${packages[@]}"; do
    (
      echo "  → Cleaning '${pkg}'..."
      if [ "$CLEAN_MODE" = "true" ] || [ "$CLEAN_MODE" = "clean" ]; then
        rm -f "packages/$pkg/package-lock.json"
      fi
      rm -rf "packages/$pkg/lib"
      # rm -rf "packages/$pkg/node_modules"
      echo "  ✅ Cleaned '${pkg}'"
    ) &
    pids+=($!)
  done
  
  # Wait for all cleanup processes to complete
  for pid in "${pids[@]}"; do
    wait "$pid"
  done
}

clean_packages "${ALL_LEVELS[@]}"

echo "🔨 Building packages by dependency levels..."

# Function to build packages in parallel
build_packages() {
  local level_name="$1"
  shift
  local packages=("$@")
  local pids=()
  
  echo "📦 Building Level $level_name packages: ${packages[*]}"
  
  for pkg in "${packages[@]}"; do
    (
      echo "  → Building '${pkg}'..."
      (
        cd "packages/$pkg"
        # --force is needed 19.1.0 react should be 19.1.1
        npm install --verbose
        npm run build
      )
      echo "  ✅ Built '${pkg}'"
    ) &
    pids+=($!)
  done
  
  # Wait for all build processes to complete
  for pid in "${pids[@]}"; do
    wait "$pid"
  done
  
  echo "✅ Level $level_name completed"
}

# Build each level sequentially, but packages within each level in parallel
build_packages "0 (Base)" "${LEVEL_0[@]}"
build_packages "1 (Common)" "${LEVEL_1[@]}"
build_packages "2 (Theme & Core)" "${LEVEL_2[@]}"
build_packages "3 (Features)" "${LEVEL_3[@]}"
build_packages "4 (Advanced Features)" "${LEVEL_4[@]}"
build_packages "5 (Final)" "${LEVEL_5[@]}"

echo "📱 Building mobile app..."

# Build mobile app
cd apps/mobile
rm -rf node_modules
if [ "$CLEAN_MODE" = "true" ] || [ "$CLEAN_MODE" = "clean" ]; then
  rm -f "package-lock.json"
fi
npm install --verbose
npm run lint 
npm run tsc
npm run test 
cd ..

echo "✅ All packages and mobile app built successfully!"
