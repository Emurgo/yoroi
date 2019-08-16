#!/bin/bash
PROD_ENV_FILE=../../.env.production
STAGING_ENV_FILE=../../.env.staging
declare -a FILES=($PROD_ENV_FILE $STAGING_ENV_FILE)
LAST_COMMIT=$(git rev-parse --short HEAD)
echo "Building app on commit $LAST_COMMIT"

# update commit hash value in env files
for ENV_FILE in "${FILES[@]}"
do
  if [ -f "$ENV_FILE" ]; then
    COMMIT=`grep "COMMIT" "$ENV_FILE" | awk -F= '{print $2}'`
    if [ -z "$COMMIT" ]; then
      echo "COMMIT key not detected in $ENV_FILE file. Inserting last commit hash..."
      echo "COMMIT=$LAST_COMMIT" >> $ENV_FILE
    else
      echo "COMMIT key detected in $ENV_FILE: $COMMIT."
      if [ $LAST_COMMIT != $COMMIT ]; then
        echo "updating commit hash..."
      fi
      sed -i.bak "/^COMMIT/s/=.*$/=$LAST_COMMIT/" $ENV_FILE
    fi
  else
    echo "$ENV_FILE file not found"
  fi
done

find ../../ -name "*.bak" -type f -delete
