#!/bin/bash

# Verify the presence of the packages directory in the current path
if [[ ! -d "packages" ]]; then
    echo "Error: 'packages' directory not found in the current path."
    return 1
fi

# Verify argument
if [[ "$1" != "--patch" && "$1" != "--minor" && "$1" != "--major" ]]; then
    echo "Usage: $0 [--patch | --minor | --major]"
    return 1
fi

# Iterate over each package and bump its version
for pkg in packages/*; do
    if [[ -d "$pkg" && ! -L "$pkg" && -f "$pkg/package.json" ]]; then
        echo "Bumping version for $pkg..."
        (
            cd "$pkg"
            yarn version "$1"
        )
    fi
done

echo "Version bump complete."