#!/bin/bash

# Verify the presence of the packages directory in the current path
if [[ ! -d "packages" ]]; then
    echo "Error: 'packages' directory not found in the current path."
    return 1
fi

# Verify argument
if [[ -z "$1" ]]; then
    echo "Usage: $0 1.20.0"
    return 1
fi

# common
yarn workspace @yoroi/common add @yoroi/types@"$1"

# api
yarn workspace @yoroi/api add @yoroi/types@"$1"
yarn workspace @yoroi/api add @yoroi/common@"$1"

# explorers 
yarn workspace @yoroi/explorers add @yoroi/types@"$1"

# portfolio 
yarn workspace @yoroi/portfolio add @yoroi/types@"$1"
yarn workspace @yoroi/portfolio add @yoroi/common@"$1"

# banners
yarn workspace @yoroi/blockchains add @yoroi/types@"$1"
yarn workspace @yoroi/blockchains add @yoroi/common@"$1"

# blockchains
yarn workspace @yoroi/blockchains add @yoroi/types@"$1"
yarn workspace @yoroi/blockchains add @yoroi/common@"$1"
yarn workspace @yoroi/blockchains add @yoroi/api@"$1"
yarn workspace @yoroi/blockchains add @yoroi/explorers@"$1"

# swap
yarn workspace @yoroi/swap add @yoroi/types@"$1"
yarn workspace @yoroi/swap add @yoroi/api@"$1"
yarn workspace @yoroi/swap add @yoroi/common@"$1"

# transfer
yarn workspace @yoroi/transfer add @yoroi/types@"$1"

# setup-wallet
yarn workspace @yoroi/setup-wallet add @yoroi/types@"$1"

# resolver
yarn workspace @yoroi/resolver add @yoroi/types@"$1"
yarn workspace @yoroi/resolver add @yoroi/common@"$1"

# links
yarn workspace @yoroi/links add @yoroi/types@"$1"
yarn workspace @yoroi/links add @yoroi/common@"$1"

# theme
yarn workspace @yoroi/theme add @yoroi/types@"$1"
yarn workspace @yoroi/theme add @yoroi/common@"$1"

# wallet-mobile
yarn workspace @yoroi/wallet-mobile add @yoroi/types@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/exchange@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/api@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/common@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/blockchains@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/swap@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/transfer@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/setup-wallet@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/links@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/staking@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/resolver@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/theme@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/dapp-connector@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/identicon@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/notifications@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/claim@"$1"

echo "Using new packages..."
