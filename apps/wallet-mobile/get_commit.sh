#!/bin/bash

BASE_DIR="$(dirname ${BASH_SOURCE[0]})"
cd $BASE_DIR
PROD_ENV_FILE=".env.production"
NIGHTLY_ENV_FILE=".env.nightly"
STAGING_ENV_FILE=".env.staging"
STORYBOOK_ENV_FILE=".env.storybook"

declare -a FILES=($PROD_ENV_FILE $NIGHTLY_ENV_FILE $STAGING_ENV_FILE $STORYBOOK_ENV_FILE)
LAST_COMMIT=$(git rev-parse --short HEAD)
if [ -z "$LAST_COMMIT" ]; then
  echo "ERROR: Couldn't get last commit hash"
  LAST_COMMIT="-"
fi
echo "Building app on commit $LAST_COMMIT"

# update commit hash value in env files
for ENV_FILE in "${FILES[@]}"
do
  if [ -f "$ENV_FILE" ]; then
    COMMIT=`grep "COMMIT" "$ENV_FILE" | awk -F= '{print $2}'`
    if [ -z "$COMMIT" ]; then
      echo "COMMIT key not detected in $ENV_FILE file. Inserting last commit hash..."
      if [ -z "$(tail -c 1 "$ENV_FILE")" ]; then
        echo "COMMIT=$LAST_COMMIT" >> $ENV_FILE
      else
        echo -e "\nCOMMIT=$LAST_COMMIT" >> $ENV_FILE
      fi
    else
      echo "COMMIT key detected in $ENV_FILE: $COMMIT."
      if [ $LAST_COMMIT != $COMMIT ]; then
        echo "updating commit hash..."
        sed -i.bak "/^COMMIT/s/=.*$/=$LAST_COMMIT/" $ENV_FILE
        find . -name "*.bak" -type f -delete
      fi
    fi
  else
    echo "$ENV_FILE file not found"
  fi
done
