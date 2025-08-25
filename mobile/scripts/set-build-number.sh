#!/bin/bash

set -euo pipefail

# Set build number script for Yoroi mobile app
# This script sets the BUILD_NUMBER environment variable for builds
#
# Usage:
#   ./scripts/set-build-number.sh [build_number]
#   ./scripts/set-build-number.sh auto  # Auto-increment from package.json
#
# Examples:
#   ./scripts/set-build-number.sh 42
#   ./scripts/set-build-number.sh auto
#   BUILD_NUMBER=42 ./scripts/set-build-number.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current build number from package.json
get_current_build() {
    node -p "require('./package.json').build || 1"
}

# Get next build number
get_next_build() {
    local current=$(get_current_build)
    echo $((current + 1))
}

# Update package.json build number
update_package_build() {
    local build_number=$1
    node -e "
        const pkg = require('./package.json');
        pkg.build = $build_number;
        require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# Main script logic
main() {
    local build_number=""
    
    # Check if running from project root
    if [ ! -f "package.json" ]; then
        echo -e "${RED}Error: Must run from project root directory${NC}"
        exit 1
    fi
    
    # Get build number from argument or environment
    if [ $# -eq 0 ]; then
        if [ -n "${BUILD_NUMBER:-}" ]; then
            build_number="$BUILD_NUMBER"
        else
            echo -e "${RED}Error: No build number provided${NC}"
            echo -e "${BLUE}Usage: $0 [build_number|auto]${NC}"
            echo -e "${BLUE}Or set BUILD_NUMBER environment variable${NC}"
            exit 1
        fi
    else
        if [ "$1" = "auto" ]; then
            build_number=$(get_next_build)
        else
            build_number="$1"
        fi
    fi
    
    # Validate build number is a positive integer
    if ! [[ "$build_number" =~ ^[1-9][0-9]*$ ]]; then
        echo -e "${RED}Error: Build number must be a positive integer${NC}"
        exit 1
    fi
    
    local current_build=$(get_current_build)
    
    echo -e "${BLUE}Current build number: $current_build${NC}"
    echo -e "${BLUE}Setting build number to: $build_number${NC}"
    
    # Update package.json
    update_package_build "$build_number"
    echo -e "${GREEN}✓ Updated package.json build number${NC}"
    
    # Export for use in builds
    export BUILD_NUMBER="$build_number"
    echo -e "${GREEN}✓ Exported BUILD_NUMBER=$build_number${NC}"
    
    echo
    echo -e "${GREEN}Build number set successfully!${NC}"
    echo -e "${BLUE}You can now run your build commands:${NC}"
    echo -e "  npx eas build --platform android --profile nightly --local"
    echo -e "  npx eas build --platform ios --profile nightly --local"
    echo -e "  fastlane android nightly"
    echo -e "  fastlane ios nightly"
}

main "$@"
