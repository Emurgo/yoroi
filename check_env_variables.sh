#!/bin/sh

BASE_DIR="$(dirname ${BASH_SOURCE[0]})"
cd $BASE_DIR

PROD_ENV_FILE=${1}
if [ -z "$PROD_ENV_FILE" ]; then
  echo "WARN: .env file name not provided, defaulting to .env.production"
  PROD_ENV_FILE=".env.production"
fi

echo "Checking env variables in file $PROD_ENV_FILE"

# retreive value of each env var to check
SHOW_INIT_DEBUG_SCREEN=`grep "SHOW_INIT_DEBUG_SCREEN" "$PROD_ENV_FILE" | awk -F= '{print $2}'`
PREFILL_WALLET_INFO=`grep "PREFILL_WALLET_INFO" "$PROD_ENV_FILE" | awk -F= '{print $2}'`
echo "SHOW_INIT_DEBUG_SCREEN=$SHOW_INIT_DEBUG_SCREEN"
echo "PREFILL_WALLET_INFO=$PREFILL_WALLET_INFO"

if [ $SHOW_INIT_DEBUG_SCREEN == 'true' ] || [ $PREFILL_WALLET_INFO == 'true' ]
then
  echo "error: should not allow debug flags for this scheme"
  exit 1
fi
