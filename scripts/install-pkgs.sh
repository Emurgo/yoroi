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
yarn workspace @yoroi/common add -D @yoroi/types@"$1"

# api
yarn workspace @yoroi/api add -D @yoroi/types@"$1"
yarn workspace @yoroi/api add @yoroi/common@"$1"

# swap
yarn workspace @yoroi/swap add -D @yoroi/types@"$1"
yarn workspace @yoroi/swap add @yoroi/api@"$1"
yarn workspace @yoroi/swap add @yoroi/openswap@"$1"

# wallet-mobile
yarn workspace @yoroi/wallet-mobile add -D @yoroi/types@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/banxa@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/api@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/common@"$1"
yarn workspace @yoroi/wallet-mobile add @yoroi/swap@"$1"

echo "Using new packages..."