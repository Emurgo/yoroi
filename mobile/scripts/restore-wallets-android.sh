#!/bin/zsh

# Script to restore multiple wallets via ADB deep links
# Usage: ./scripts/restore-wallets-android.sh [package_name] [mnemonic1] [mnemonic2] ... [mnemonicN]
#        ./scripts/restore-wallets-android.sh [package_name] --file wallets.txt
# Default package: com.emurgo.dev (use com.emurgo for production builds)
#
# Wallet file format (one mnemonic per line, space-separated words):
# word1 word2 word3 ... word15
# another word1 word2 word3 ... word15

# Parse arguments
PACKAGE_NAME="com.emurgo.dev"
MNEMONICS=()
FILE_PATH=""
USE_FILE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --file|-f)
      USE_FILE=true
      FILE_PATH="$2"
      shift 2
      ;;
    --package|-p)
      PACKAGE_NAME="$2"
      shift 2
      ;;
    *)
      # Check if it's a file first (before checking package name pattern)
      if [ ${#MNEMONICS[@]} -eq 0 ] && [ $# -eq 1 ] && [ -f "$1" ]; then
        # Single remaining argument that exists as a file - treat as file input
        USE_FILE=true
        FILE_PATH="$1"
        shift
      elif [ ${#MNEMONICS[@]} -eq 0 ] && [[ ! "$1" =~ [[:space:]] ]] && [[ ! "$1" =~ ^- ]] && [[ "$1" =~ \. ]]; then
        # If first arg doesn't start with -- and looks like a package name, treat as package
        PACKAGE_NAME="$1"
        shift
      else
        # Otherwise treat as mnemonic
        MNEMONICS+=("$1")
        shift
      fi
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to URL encode
url_encode() {
  echo -n "$1" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read(), safe=''))"
}

# Function to restore a single wallet (supports mnemonic, rootKey, or full URL)
restore_wallet() {
  local input="$1"
  local wallet_name="${2:-Restored Wallet}"
  local wallet_index="${3:-1}"
  local implementation="${4:-cardano-cip1852}"
  local address_mode="${5:-single}"
  local account_visual="${6:-0}"
  local encryption="${7:-plain}"
  
  local deep_link=""
  local display_info=""
  
  # Check if input is already a full deep link URL
  # Use string matching first (more reliable than regex for special chars)
  if [[ "$input" == web+cardano://* ]] || \
     [[ "$input" == yoroi://* ]] || \
     [[ "$input" == *"?type="* ]] || \
     ([[ "$input" == *"://"* ]] && [[ "$input" == *"?"* ]]); then
    # It's already a full URL, use it directly
    deep_link="$input"
    # Detect wallet type from URL
    if [[ "$input" =~ type=readonly ]] || [[ "$input" =~ accountPubKey= ]]; then
      display_info="Readonly Wallet URL: ${input:0:60}..."
    elif [[ "$input" =~ type=full ]] || [[ "$input" =~ rootKey= ]] || [[ "$input" =~ mnemonic= ]]; then
      display_info="Full Wallet URL: ${input:0:60}..."
    else
      display_info="Full URL: ${input:0:60}..."
    fi
  # Detect if input is an accountPubKey (hex string, typically 128 chars for readonly)
  # Check if it looks like accountPubKey by checking if it's exactly 128 hex chars
  elif [[ "$input" =~ ^[0-9a-fA-F]{128}$ ]] && [[ ! "$input" =~ [[:space:]] ]]; then
    # It's likely an accountPubKey for readonly wallet
    local account_pub_key_encoded=$(url_encode "$input")
    local name_encoded=$(url_encode "$wallet_name")
    local impl_encoded=$(url_encode "$implementation")
    local addr_mode_encoded=$(url_encode "$address_mode")
    
    # Construct deep link with accountPubKey (readonly)
    # Format: web+cardano://wallet/v1?type=readonly&accountPubKey=...&encryption=...&name=...&implementation=...&addressMode=...&accountVisual=...
    deep_link="web+cardano://wallet/v1?type=readonly&accountPubKey=${account_pub_key_encoded}&encryption=${encryption}&name=${name_encoded}&implementation=${impl_encoded}&addressMode=${addr_mode_encoded}&accountVisual=${account_visual}"
    display_info="AccountPubKey (Readonly): ${input:0:32}...${input: -16}"
  # Detect if input is a rootKey (hex string, typically 64+ chars, no spaces)
  elif [[ "$input" =~ ^[0-9a-fA-F]{64,}$ ]] && [[ ! "$input" =~ [[:space:]] ]]; then
    # It's a rootKey (hex string) - assume full wallet
    local root_key_encoded=$(url_encode "$input")
    local name_encoded=$(url_encode "$wallet_name")
    local impl_encoded=$(url_encode "$implementation")
    local addr_mode_encoded=$(url_encode "$address_mode")
    
    # Construct deep link with rootKey
    # Format: web+cardano://wallet/v1?type=full&rootKey=...&encryption=...&name=...&implementation=...&addressMode=...&accountVisual=...
    deep_link="web+cardano://wallet/v1?type=full&rootKey=${root_key_encoded}&encryption=${encryption}&name=${name_encoded}&implementation=${impl_encoded}&addressMode=${addr_mode_encoded}&accountVisual=${account_visual}"
    display_info="RootKey (Full): ${input:0:32}...${input: -16}"
  else
    # It's a mnemonic (words separated by spaces)
    local word_count=$(echo "$input" | wc -w | tr -d ' ')
    if [[ ! "$word_count" =~ ^(12|15|24)$ ]]; then
      echo -e "${RED}Error: Invalid mnemonic length ($word_count words). Must be 12, 15, or 24 words.${NC}"
      return 1
    fi
    
    local mnemonic_encoded=$(url_encode "$input")
    local name_encoded=$(url_encode "$wallet_name")
    
    # Construct deep link with mnemonic
    # Format: web+cardano://wallet/v1?type=full&mnemonic=...&name=...
    deep_link="web+cardano://wallet/v1?type=full&mnemonic=${mnemonic_encoded}&name=${name_encoded}"
    display_info="Mnemonic: ${input:0:50}... (${word_count} words)"
  fi
  
  echo -e "${BLUE}========================================${NC}"
  echo -e "${GREEN}Restoring Wallet #${wallet_index}${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${YELLOW}Name:${NC} $wallet_name"
  echo -e "${YELLOW}${display_info}${NC}"
  echo ""
  
  # Fire the ADB command
  echo -e "${BLUE}Executing ADB command...${NC}"
  echo -e "${YELLOW}Deep link length:${NC} ${#deep_link} characters"
  echo -e "${YELLOW}Deep link preview:${NC} ${deep_link:0:100}..."
  echo ""
  
  # Log the full URL for debugging (truncate if too long for display)
  if [ ${#deep_link} -gt 200 ]; then
    echo -e "${YELLOW}Full URL (first 200 chars):${NC} ${deep_link:0:200}..."
    echo -e "${YELLOW}Full URL (last 100 chars):${NC} ...${deep_link: -100}"
  else
    echo -e "${YELLOW}Full URL:${NC} $deep_link"
  fi
  echo ""
  
  # Properly escape the URL for ADB shell command
  # We need to pass the URL to the Android shell without it being interpreted
  # The trick: escape single quotes in URL, then wrap in single quotes for remote shell
  # Format: 'escaped_url' where any ' in URL becomes '\''
  local escaped_url=$(echo "$deep_link" | sed "s/'/'\\\\''/g")
  # Construct the command string that will be executed on Android
  # Single quotes around URL prevent Android shell from interpreting &, spaces, etc.
  local adb_cmd="am start -W -a android.intent.action.VIEW -d '$escaped_url'"
  adb shell "$adb_cmd"
  
  local exit_code=$?
  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✓ ADB command executed successfully${NC}"
  else
    echo -e "${RED}✗ ADB command failed with exit code: $exit_code${NC}"
  fi
  
  # Give the app time to process the deep link
  echo -e "${YELLOW}Waiting 2 seconds for app to process...${NC}"
  sleep 2
  
  echo ""
  return $exit_code
}

# Function to read wallets from file
read_wallets_from_file() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo -e "${RED}Error: File not found: $file${NC}"
    return 1
  fi
  
  # Read all valid wallet lines into an array first (avoids stdin redirection issues)
  local wallets=()
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Trim whitespace
    line=$(echo "$line" | xargs)
    
    # Skip if still empty after trimming
    [[ -z "$line" ]] && continue
    
    wallets+=("$line")
  done < "$file"
  
  local total_wallets=${#wallets[@]}
  echo -e "${BLUE}Found ${total_wallets} wallet(s) to restore${NC}"
  echo ""
  
  local index=1
  for mnemonic in "${wallets[@]}"; do
    restore_wallet "$mnemonic" "Wallet $index" "$index"
    
    # Always pause after each wallet
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo -e "${YELLOW}Wallet #${index} restoration initiated${NC}"
    echo -e "${YELLOW}Please wait for the wallet to be added in the app...${NC}"
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo ""
    
    # Pause between wallets (always pause, even after the last one)
    if [ $index -lt $total_wallets ]; then
      echo -e "${BLUE}Press Enter when ready to restore the next wallet (${index}/${total_wallets})...${NC}"
    else
      echo -e "${BLUE}Press Enter to finish (${index}/${total_wallets})...${NC}"
    fi
    
    # Wait for user input - stdin is not redirected, so normal read works
    read -r
    echo ""
    
    index=$((index + 1))
  done
}

# Main execution
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Yoroi Wallet Restoration Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Package:${NC} $PACKAGE_NAME"
echo ""

# Check if ADB is available
if ! command -v adb &> /dev/null; then
  echo -e "${RED}Error: adb command not found. Please install Android SDK Platform Tools.${NC}"
  exit 1
fi

# Check if device is connected
if ! adb devices | grep -q "device$"; then
  echo -e "${RED}Error: No Android device connected. Please connect a device and enable USB debugging.${NC}"
  exit 1
fi

echo -e "${GREEN}Device connected:${NC}"
adb devices | grep "device$"
echo ""

# Check if reading from file
if [ "$USE_FILE" = true ]; then
  if [ -z "$FILE_PATH" ]; then
    echo -e "${RED}Error: --file option requires a file path${NC}"
    echo "Usage: $0 [--package package_name] --file wallets.txt"
    exit 1
  fi
  read_wallets_from_file "$FILE_PATH"
else
  # Read mnemonics from command line arguments
  if [ ${#MNEMONICS[@]} -eq 0 ]; then
    echo -e "${RED}Error: No mnemonics provided${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 [--package package_name] [mnemonic1] [mnemonic2] ... [mnemonicN]"
    echo "  $0 [--package package_name] --file wallets.txt"
    echo "  $0 wallets.txt  # Shortcut: if single arg is a file, treat as --file"
    echo ""
    echo "Examples:"
    echo "  $0 --package com.emurgo.dev \"word1 word2 ... word15\" \"another word1 word2 ... word15\""
    echo "  $0 com.emurgo.dev \"word1 word2 ... word15\" \"another word1 word2 ... word15\""
    echo "  $0 --file wallets.txt"
    echo "  $0 wallets.txt  # Automatically detects file"
    echo "  $0 --package com.emurgo --file wallets.txt"
    exit 1
  fi
  
  local index=1
  local total=${#MNEMONICS[@]}
  for mnemonic in "${MNEMONICS[@]}"; do
    restore_wallet "$mnemonic" "Wallet $index" "$index"
    
    # Always pause after each wallet
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo -e "${YELLOW}Wallet #${index} restoration initiated${NC}"
    echo -e "${YELLOW}Please wait for the wallet to be added in the app...${NC}"
    echo -e "${YELLOW}════════════════════════════════════${NC}"
    echo ""
    
    if [ $index -lt $total ]; then
      echo -e "${BLUE}Press Enter when ready to restore the next wallet...${NC}"
    else
      echo -e "${BLUE}Press Enter to finish...${NC}"
    fi
    
    # Wait for user input - read from terminal explicitly
    read -r < /dev/tty
    echo ""
    
    index=$((index + 1))
  done
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}All wallets processed!${NC}"
echo -e "${BLUE}========================================${NC}"

