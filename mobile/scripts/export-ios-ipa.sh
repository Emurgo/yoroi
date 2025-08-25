#!/bin/bash

set -euo pipefail

# Exports an iOS IPA from an Xcode archive created for a given scheme and configuration.
#
# Prerequisites:
# - Xcode command line tools installed
# - Code signing configured in Xcode project or via automatic signing
# - A valid exportOptionsPlist provided, or specify 'app-store' | 'ad-hoc' | 'enterprise' | 'development'
#
# Usage examples:
#   ./scripts/export-ios-ipa.sh <scheme> <configuration> <archivePath> <exportPath> <exportOptionsPlist>
#   ./scripts/export-ios-ipa.sh yoroi Release "~/Library/Developer/Xcode/Archives/2025-08-24/yoroi 23-59-59.xcarchive" ./dist ./ExportOptions-appstore.plist
#   ./scripts/export-ios-ipa.sh yoroi Release auto ./dist app-store
#
# If archivePath is 'auto', the latest xcarchive for the scheme is used.
# If exportOptionsPlist is one of: app-store|ad-hoc|enterprise|development, a temporary plist will be generated.

if [ "$#" -ne 5 ]; then
  echo "Usage: $0 <scheme> <configuration> <archivePath|auto> <exportPath> <exportOptionsPlist|app-store|ad-hoc|enterprise|development>"
  exit 1
fi

SCHEME="$1"
CONFIG="$2"
ARCHIVE_PATH_INPUT="$3"
EXPORT_PATH="$4"
EXPORT_OPTIONS_INPUT="$5"

mkdir -p "$EXPORT_PATH"

if [ "$ARCHIVE_PATH_INPUT" = "auto" ]; then
  echo "[export-ios-ipa] Locating latest archive for scheme: $SCHEME"
  ARCHIVE_PATH=$(find "$HOME/Library/Developer/Xcode/Archives" -type d -name "*.xcarchive" -print0 | xargs -0 ls -t | head -n1)
  if [ -z "${ARCHIVE_PATH:-}" ]; then
    echo "No archives found. Create one with: xcodebuild -scheme $SCHEME -configuration $CONFIG -workspace ios/yoroi.xcworkspace -archivePath <path>.xcarchive archive"
    exit 1
  fi
else
  ARCHIVE_PATH="$ARCHIVE_PATH_INPUT"
fi

if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "Archive not found: $ARCHIVE_PATH"
  exit 1
fi

TMP_PLIST=""
case "$EXPORT_OPTIONS_INPUT" in
  app-store|ad-hoc|enterprise|development)
    METHOD="$EXPORT_OPTIONS_INPUT"
    TMP_PLIST=$(mktemp /tmp/exportOptions.XXXXXX.plist)
    cat > "$TMP_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>$METHOD</string>
  <key>compileBitcode</key>
  <false/>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>stripSwiftSymbols</key>
  <true/>
  <key>destination</key>
  <string>export</string>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
</dict>
 </plist>
EOF
    EXPORT_OPTIONS_PLIST="$TMP_PLIST"
    ;;
  *)
    EXPORT_OPTIONS_PLIST="$EXPORT_OPTIONS_INPUT"
    ;;
esac

if [ ! -f "$EXPORT_OPTIONS_PLIST" ]; then
  echo "exportOptionsPlist not found: $EXPORT_OPTIONS_PLIST"
  [ -n "$TMP_PLIST" ] && rm -f "$TMP_PLIST"
  exit 1
fi

echo "[export-ios-ipa] Exporting IPA from: $ARCHIVE_PATH"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
  -allowProvisioningUpdates

echo "[export-ios-ipa] Exported files:"
ls -la "$EXPORT_PATH"

[ -n "$TMP_PLIST" ] && rm -f "$TMP_PLIST"

echo "[export-ios-ipa] Done."


