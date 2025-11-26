#!/bin/zsh

# Test script for all Yoroi deep link types on Android
# Usage: ./scripts/test-all-links-android.sh [package_name]
# Default package: com.emurgo.dev (use com.emurgo for production builds)

PACKAGE_NAME=${1:-com.emurgo.dev}
echo "Testing links with package: $PACKAGE_NAME"
echo "=========================================="
echo ""

# Helper function to URL encode
url_encode() {
  echo -n "$1" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read()))"
}

# Test 1: Transfer Request ADA (direct params)
echo "1. Testing: Transfer Request ADA (direct params)"
echo "-------------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000&memo=Test+transfer&appId=test-app&message=Testing+direct+ADA+transfer"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 2: Transfer Request ADA with Link (Cardano link)
echo "2. Testing: Transfer Request ADA with Link"
echo "-------------------------------------------"
CARDANO_LINK="web+cardano:addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2?amount=10"
ENCODED_LINK=$(url_encode "$CARDANO_LINK")
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=$ENCODED_LINK&isSandbox=true&isTestnet=false&appId=test-app&message=Testing+ADA+transfer+with+link&walletId=c4832ba5-c03e-4bd8-93ee-52536f1b1747&authorization=ac0692d3-bf34-44e2-b57d-53e4ce47666b&redirectTo=https%3A%2F%2Fyoroi-wallet.com"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 3: Exchange Order Show Create Result
echo "3. Testing: Exchange Order Show Create Result"
echo "-----------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=changelly&coinAmount=100&coin=ADA&fiatAmount=50&fiat=USD&status=success&orderType=buy&appId=test-app&message=Exchange+order+completed"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 4: Browser Launch DApp URL
echo "4. Testing: Browser Launch DApp URL"
echo "-----------------------------------"
DAPP_URL="https://steelswap.io/swap?input=&output=fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
ENCODED_DAPP_URL=$(url_encode "$DAPP_URL")
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=$ENCODED_DAPP_URL&appId=test-app&message=Launching+dApp&redirectTo=https%3A%2F%2Fyoroi-wallet.com"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 5: Cardano Claim Link (web+cardano://claim)
echo "5. Testing: Cardano Claim Link"
echo "------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://claim/v1?code=TEST123&faucet_url=https%3A%2F%2Ftestnet-faucet.example.com"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 6: Cardano Browse Link (web+cardano://browse)
echo "6. Testing: Cardano Browse Link (CIP-158)"
echo "------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://browse/v1?scheme=https&namespaced_domain=io.steelswap&app_path=/swap&url=https%3A%2F%2Fsteelswap.io%2Fswap%3Finput%3D%26output%3Dfe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 7: Cardano Pay Link (web+cardano://pay)
echo "7. Testing: Cardano Pay Link (CIP-PR843)"
echo "-----------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://pay/v1?address=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&amount=1000000&memo=Test+payment"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 8: Cardano Legacy Payment Link (web+cardano://payment)
echo "8. Testing: Cardano Legacy Payment Link (CIP-13)"
echo "-------------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2?amount=1000000&memo=Legacy+payment+test"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 9: Cardano Stake Pool Link (web+cardano://stake)
echo "9. Testing: Cardano Stake Pool Link"
echo "-----------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://stake/v1?pool=b19f2d9498845652ae6eea5da77952b37e2bca9f59b2a98c56694cae"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 10: Cardano Transaction Link (web+cardano://transaction)
echo "10. Testing: Cardano Transaction Link (CIP-107)"
echo "-----------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://transaction/v1?hash=f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 11: Cardano Block Link (web+cardano://block)
echo "11. Testing: Cardano Block Link (CIP-107)"
echo "------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://block/v1?hash=f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846&height=12345678"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 12: Cardano Address Link (web+cardano://address)
echo "12. Testing: Cardano Address Link (CIP-134)"
echo "---------------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://address/v1?address=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 13: Cardano Connect Link (web+cardano://connect) - P2P
echo "13. Testing: Cardano Connect Link (P2P)"
echo "-----------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://connect/v1?peerId=peer123&signalingUrl=https%3A%2F%2Fsignaling.example.com"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

# Test 14: Universal Link (HTTPS)
echo "14. Testing: Universal Link (HTTPS)"
echo "------------------------------------"
adb shell am start -W -a android.intent.action.VIEW -d "https://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000"
echo ""
read -q "?Press any key to continue to next test..."
echo ""
echo ""

echo "All link tests completed!"
echo ""
echo "Summary:"
echo "- Tested 4 Yoroi link types (transfer, exchange, browser)"
echo "- Tested 9 Cardano link types (claim, browse, pay, payment, stake, transaction, block, address, connect)"
echo "- Tested Universal Links (HTTPS)"
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

