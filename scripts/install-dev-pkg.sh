#!/bin/bash

# Verify the presence of the packages directory in the current path
if [[ ! -d "packages" ]]; then
    echo "Error: 'packages' directory not found in the current path."
    return 1
fi

# Verify argument
if [[ -z "$1" ]]; then
    echo "Usage: $0"
    return 1
fi

yarn workspace @yoroi/api add -D "$1"
yarn workspace @yoroi/exchange add -D "$1"
yarn workspace @yoroi/common add -D "$1"
yarn workspace @yoroi/links add -D "$1"
yarn workspace @yoroi/resolver add -D "$1"
yarn workspace @yoroi/staking add -D "$1"
yarn workspace @yoroi/swap add -D "$1"
yarn workspace @yoroi/theme add -D "$1"
yarn workspace @yoroi/transfer add -D "$1"
yarn workspace @yoroi/setup-wallet add -D "$1"
yarn workspace @yoroi/types add -D "$1"
yarn workspace @yoroi/wallet-mobile add -D "$1"


