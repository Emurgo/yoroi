#!/bin/bash

set -euo pipefail

# Version bump script for Yoroi mobile app
# Supports semantic versioning (major.minor.patch) and build number increments
#
# Usage:
#   ./scripts/version-bump.sh [major|minor|patch|build] [--dry-run]
#   ./scripts/version-bump.sh set <version> [--dry-run]
#
# Examples:
#   ./scripts/version-bump.sh patch          # Bump patch version (1.0.0 -> 1.0.1)
#   ./scripts/version-bump.sh minor          # Bump minor version (1.0.1 -> 1.1.0)
#   ./scripts/version-bump.sh major          # Bump major version (1.1.0 -> 2.0.0)
#   ./scripts/version-bump.sh build          # Bump build number only
#   ./scripts/version-bump.sh set 2.1.3      # Set specific version
#   ./scripts/version-bump.sh patch --dry-run # Show what would change

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Files to update
PACKAGE_JSON="package.json"
APP_CONFIG_DEV="app.config.js"
APP_CONFIG_NIGHTLY="app.config.nightly.js"
APP_CONFIG_PRODUCTION="app.config.production.js"

# Current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Current build number (if exists)
get_current_build() {
    node -p "require('./package.json').build || 1"
}

# Get current build number from environment or package.json
get_build_number() {
    echo "${BUILD_NUMBER:-$(get_current_build)}"
}

# Validate semantic version format
validate_version() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo -e "${RED}Error: Invalid version format. Expected major.minor.patch (e.g., 1.0.0)${NC}"
        exit 1
    fi
}

# Bump version according to type
bump_version() {
    local current_version=$1
    local bump_type=$2
    
    case $bump_type in
        major)
            echo $current_version | awk -F. '{print ($1+1) ".0.0"}'
            ;;
        minor)
            echo $current_version | awk -F. '{print $1 "." ($2+1) ".0"}'
            ;;
        patch)
            echo $current_version | awk -F. '{print $1 "." $2 "." ($3+1)}'
            ;;
        build)
            # Keep same version, just increment build number
            echo $current_version
            ;;
        *)
            echo -e "${RED}Error: Invalid bump type. Use major, minor, patch, or build${NC}"
            exit 1
            ;;
    esac
}

# Update package.json version
update_package_json() {
    local new_version=$1
    local new_build=$2
    local dry_run=$3
    
    if [ "$dry_run" = "true" ]; then
        echo -e "${BLUE}[DRY RUN] Would update package.json:${NC}"
        echo -e "  version: $(get_current_version) -> $new_version"
        echo -e "  build: $(get_current_build) -> $new_build"
    else
        # Update version using node
        node -e "
            const pkg = require('./package.json');
            pkg.version = '$new_version';
            pkg.build = $new_build;
            require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
        "
        echo -e "${GREEN}✓ Updated package.json: version=$new_version, build=$new_build${NC}"
    fi
}

# Update app config files
update_app_configs() {
    local new_version=$1
    local dry_run=$3
    
    local config_files=("$APP_CONFIG_DEV" "$APP_CONFIG_NIGHTLY" "$APP_CONFIG_PRODUCTION")
    
    for config_file in "${config_files[@]}"; do
        if [ -f "$config_file" ]; then
            if [ "$dry_run" = "true" ]; then
                echo -e "${BLUE}[DRY RUN] Would update $config_file:${NC}"
                echo -e "  version: $(grep -o "version: '[^']*'" "$config_file") -> version: '$new_version'"
            else
                # Update version in app config
                sed -i.bak "s/version: '[^']*'/version: '$new_version'/g" "$config_file"
                rm -f "${config_file}.bak"
                echo -e "${GREEN}✓ Updated $config_file${NC}"
            fi
        else
            echo -e "${YELLOW}Warning: $config_file not found${NC}"
        fi
    done
}

# Main script logic
main() {
    local bump_type=$1
    local dry_run=false
    
    # Check for --dry-run flag
    if [[ "$*" == *"--dry-run"* ]]; then
        dry_run=true
        echo -e "${YELLOW}Running in dry-run mode - no files will be modified${NC}"
    fi
    
    local current_version=$(get_current_version)
    local current_build=$(get_build_number)
    
    echo -e "${BLUE}Current version: $current_version (build: $current_build)${NC}"
    
    case $bump_type in
        set)
            local new_version=$2
            validate_version "$new_version"
            local new_build=$((current_build + 1))
            ;;
        major|minor|patch|build)
            local new_version
            if [ "$bump_type" = "build" ]; then
                new_version=$current_version
            else
                new_version=$(bump_version "$current_version" "$bump_type")
            fi
            local new_build=$((current_build + 1))
            ;;
        *)
            echo -e "${RED}Error: Invalid command. Use: major, minor, patch, build, or set <version>${NC}"
            echo -e "${BLUE}Usage: $0 [major|minor|patch|build|set <version>] [--dry-run]${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${BLUE}New version: $new_version (build: $new_build)${NC}"
    echo
    
    # Update files
    update_package_json "$new_version" "$new_build" "$dry_run"
    update_app_configs "$new_version" "$new_build" "$dry_run"
    
    if [ "$dry_run" = "false" ]; then
        echo
        echo -e "${GREEN}Version bump completed successfully!${NC}"
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "  1. Review changes: git diff"
        echo -e "  2. Commit changes: git add . && git commit -m \"Bump version to $new_version\""
        echo -e "  3. Tag release: git tag v$new_version"
        echo -e "  4. Build and deploy using fastlane or EAS"
    fi
}

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No arguments provided${NC}"
    echo -e "${BLUE}Usage: $0 [major|minor|patch|build|set <version>] [--dry-run]${NC}"
    exit 1
fi

main "$@"
