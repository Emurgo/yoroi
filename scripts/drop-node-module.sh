#!/bin/bash

# Define the base directories
base_dirs=("apps" "packages")

# Loop through each base directory
for base_dir in "${base_dirs[@]}"; do
    # Find all subdirectories (excluding node_modules itself)
    for dir in $(find $base_dir -maxdepth 1 -mindepth 1 -type d); do
        # Define the node_modules path
        nm_path="$dir/node_modules"

        # Check if node_modules exists and remove it
        if [ -d "$nm_path" ]; then
            echo "Removing $nm_path"
            rm -rf "$nm_path"
        else
            echo "No node_modules found in $dir"
        fi
    done
done

echo "Cleanup completed."