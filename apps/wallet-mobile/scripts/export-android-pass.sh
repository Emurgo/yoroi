#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: ./export-android-pass <file_path>"
  exit 1
fi

file_path=$1

if [ ! -f "$file_path" ]; then
  echo "File not found: $file_path"
  exit 1
fi

file_content=$(cat "$file_path")

export ANDROID_KEYSTORE_PASS="$file_content"
export ANDROID_KEY_PASS="$file_content"