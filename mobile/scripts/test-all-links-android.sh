#!/bin/zsh

# Test script for all Yoroi deep link types on Android
# Usage: ./scripts/test-all-links-android.sh [package_name] [test_number]
#   package_name: Android package name (default: com.emurgo.dev)
#   test_number: Test number 1-15 to run a specific test (default: run all tests)
# Examples:
#   ./scripts/test-all-links-android.sh                    # Run all tests with default package
#   ./scripts/test-all-links-android.sh com.emurgo 5       # Run only test 5 with production package
#   ./scripts/test-all-links-android.sh com.emurgo.dev 1   # Run only test 1 with dev package

# Parse arguments: handle both cases
# Case 1: ./script.sh [package] [test_number]
# Case 2: ./script.sh [test_number] (uses default package)
if [[ "$1" =~ ^[0-9]+$ ]] && [[ "$1" -ge 1 ]] && [[ "$1" -le 15 ]]; then
  # First arg is a test number
  TEST_NUMBER=$1
  PACKAGE_NAME=${2:-com.emurgo.dev}
else
  # First arg is package name (or default)
  PACKAGE_NAME=${1:-com.emurgo.dev}
  if [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 1 ]] && [[ "$2" -le 15 ]]; then
    TEST_NUMBER=$2
  else
    TEST_NUMBER=""
  fi
fi

if [ -n "$TEST_NUMBER" ]; then
  echo "Running test $TEST_NUMBER with package: $PACKAGE_NAME"
else
  echo "Testing all links with package: $PACKAGE_NAME"
fi
echo "=========================================="
echo ""

# Helper function to URL encode
url_encode() {
  echo -n "$1" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read()))"
}

# Test 1: Transfer Request ADA (direct params) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 1 ]; then
  echo "1. Testing: Transfer Request ADA (direct params)"
  echo "-------------------------------------------------"
  TRANSFER_URL="yoroi://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000&memo=Test+transfer&appId=test-app&message=Testing+direct+ADA+transfer"
  ESCAPED_URL=$(echo "$TRANSFER_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 2: Transfer Request ADA with Link (Cardano link) PASSED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 2 ]; then
  echo "2. Testing: Transfer Request ADA with Link"
  echo "-------------------------------------------"
  CARDANO_LINK="web+cardano:addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2?amount=10"
  ENCODED_LINK=$(url_encode "$CARDANO_LINK")
  TRANSFER_LINK_URL="yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=$ENCODED_LINK&isSandbox=true&isTestnet=false&appId=test-app&message=Testing+ADA+transfer+with+link&walletId=c4832ba5-c03e-4bd8-93ee-52536f1b1747&authorization=ac0692d3-bf34-44e2-b57d-53e4ce47666b&redirectTo=https%3A%2F%2Fyoroi-wallet.com"
  ESCAPED_URL=$(echo "$TRANSFER_LINK_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 3: Exchange Order Show Create Result FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 3 ]; then
  echo "3. Testing: Exchange Order Show Create Result"
  echo "-----------------------------------------------"
  # Using values from state.mocks.ts
  MESSAGE_ENCODED=$(url_encode "Your order number 131234 is under processing, bare with us.")
  REDIRECT_TO_ENCODED=$(url_encode "https://yoroi-wallet.com/about")
  EXCHANGE_URL="yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=encryputs&coinAmount=1&coin=ADA&fiatAmount=1&fiat=USD&status=success&orderType=buy&appId=a386e806-92f4-4796-ad61-7a1485b6e745&authorization=fca6fc26-abc6-4cdc-bdce-5910cc3c0a01&isSandbox=true&message=$MESSAGE_ENCODED&redirectTo=$REDIRECT_TO_ENCODED"
  ESCAPED_URL=$(echo "$EXCHANGE_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 4: Browser Launch DApp URL PASSED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 4 ]; then
  echo "4. Testing: Browser Launch DApp URL"
  echo "-----------------------------------"
  DAPP_URL="https://steelswap.io/swap?input=&output=fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
  ENCODED_DAPP_URL=$(url_encode "$DAPP_URL")
  BROWSER_URL="yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=$ENCODED_DAPP_URL&appId=test-app&message=Launching+dApp&redirectTo=https%3A%2F%2Fyoroi-wallet.com"
  ESCAPED_URL=$(echo "$BROWSER_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 5: Cardano Claim Link (web+cardano://claim) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 5 ]; then
  echo "5. Testing: Cardano Claim Link"
  echo "------------------------------"
  # Using a realistic testnet faucet URL format (actual faucet may vary)
  # Note: Both code and faucet_url are required parameters
  # Keep & unencoded in URL structure, only encode parameter values
  FAUCET_URL_ENCODED=$(url_encode "https://faucet.com")
  # Construct the full URL - the & must remain unencoded as it's the query parameter separator
  CLAIM_URL="web+cardano://claim/v1?code=42&faucet_url=$FAUCET_URL_ENCODED"
  echo "Debug: Constructed URL = $CLAIM_URL"
  # Properly escape the URL for ADB shell command
  # Escape single quotes in URL, then wrap in single quotes for remote shell
  # This prevents Android shell from interpreting &, spaces, etc.
  ESCAPED_URL=$(echo "$CLAIM_URL" | sed "s/'/'\\\\''/g")
  # Pass the escaped URL wrapped in single quotes to prevent shell interpretation
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 6: Cardano Browse Link (web+cardano://browse)
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 6 ]; then
  echo "6. Testing: Cardano Browse Link (CIP-158)"
  echo "------------------------------------------"
  # Browse uses path-based format: web+cardano://browse/v1/{scheme}/{namespaced_domain}/{app_path}?query
  BROWSE_URL="web+cardano://browse/v1/https/io.steelswap/swap?input=&output=fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
  ESCAPED_URL=$(echo "$BROWSE_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 7: Cardano Pay Link (web+cardano://pay) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 7 ]; then
  echo "7. Testing: Cardano Pay Link (CIP-PR843)"
  echo "-----------------------------------------"
  PAY_URL="web+cardano://pay/v1?address=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&amount=1000000&memo=Test+payment"
  ESCAPED_URL=$(echo "$PAY_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 8: Cardano Legacy Payment Link (web+cardano:) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 8 ]; then
  echo "8. Testing: Cardano Legacy Payment Link (CIP-13)"
  echo "-------------------------------------------------"
  # Legacy format uses single colon: web+cardano:{address}?params
  LEGACY_PAYMENT_URL="web+cardano:addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2?amount=1000000&memo=Legacy+payment+test"
  ESCAPED_URL=$(echo "$LEGACY_PAYMENT_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 9: Cardano Stake Pool Link (web+cardano://stake) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 9 ]; then
  echo "9. Testing: Cardano Stake Pool Link"
  echo "-----------------------------------"
  adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://stake/v1?pool=b19f2d9498845652ae6eea5da77952b37e2bca9f59b2a98c56694cae"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 10: Cardano Transaction Link (web+cardano://transaction) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 10 ]; then
  echo "10. Testing: Cardano Transaction Link (CIP-107)"
  echo "-----------------------------------------------"
  # Transaction uses path-based format: web+cardano://transaction/v1/{hash}
  adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://transaction/v1/f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 11: Cardano Block Link (web+cardano://block) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 11 ]; then
  echo "11. Testing: Cardano Block Link (CIP-107)"
  echo "------------------------------------------"
  BLOCK_URL="web+cardano://block/v1?hash=f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846&height=12345678"
  ESCAPED_URL=$(echo "$BLOCK_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 12: Cardano Address Link (web+cardano://address) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 12 ]; then
  echo "12. Testing: Cardano Address Link (CIP-134)"
  echo "---------------------------------------------"
  # Address uses path-based format: web+cardano://address/v1/{address}
  adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://address/v1/addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 13: Cardano Connect Link (web+cardano://connect) - P2P FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 13 ]; then
  echo "13. Testing: Cardano Connect Link (P2P)"
  echo "-----------------------------------------"
  CONNECT_URL="web+cardano://connect/v1?peerId=peer123&signalingUrl=https%3A%2F%2Fsignaling.example.com"
  ESCAPED_URL=$(echo "$CONNECT_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 14: Universal Link (HTTPS) FAILED
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 14 ]; then
  echo "14. Testing: Universal Link (HTTPS)"
  echo "------------------------------------"
  UNIVERSAL_URL="https://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000"
  ESCAPED_URL=$(echo "$UNIVERSAL_URL" | sed "s/'/'\\\\''/g")
  adb shell "am start -W -a android.intent.action.VIEW -d '$ESCAPED_URL'"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

# Test 15: Cardano DRep Delegation Link (web+cardano://drep)
if [ -z "$TEST_NUMBER" ] || [ "$TEST_NUMBER" -eq 15 ]; then
  echo "15. Testing: Cardano DRep Delegation Link"
  echo "-----------------------------------------"
  DREP_ID="drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j"
  ENCODED_DREP_ID=$(url_encode "$DREP_ID")
  adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://drep/v1?drep=$ENCODED_DREP_ID"
  echo ""
  if [ -z "$TEST_NUMBER" ]; then
    read -q "?Press any key to continue to next test..."
    echo ""
    echo ""
  fi
fi

if [ -z "$TEST_NUMBER" ]; then
  echo "All link tests completed!"
  echo ""
  echo "Summary:"
  echo "- Tested 4 Yoroi link types (transfer, exchange, browser)"
  echo "- Tested 10 Cardano link types (claim, browse, pay, payment, stake, drep, transaction, block, address, connect)"
  echo "- Tested Universal Links (HTTPS)"
else
  echo "Test $TEST_NUMBER completed!"
fi
echo ""
echo "Note: Some links may require specific parameters:"
echo "- walletId: UUID of the wallet (required for some flows)"
echo "- authorization: UUID authorization token (required for some flows)"
echo "- signature: Partner signature (optional, affects warnings)"
echo "- isSandbox: true/false (for dev builds)"
echo "- isTestnet: true/false (for testnet wallets)"
echo "- redirectTo: HTTPS URL for redirect after action"
echo "- appId: Partner app identifier (max 40 chars)"
echo "- message: User-facing message (max 256 chars)"
echo ""
echo "For detailed documentation, see: scripts/test-links-README.md"

