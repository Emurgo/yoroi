#!/bin/bash
PROD_ENV_FILE=.env.production
STAGING_ENV_FILE=.env.staging
LAST_COMMIT=$(git rev-parse --short HEAD)
echo "Building app on commit $LAST_COMMIT"

if [ -f "$PROD_ENV_FILE" ]; then
  COMMIT=`grep "COMMIT" "$PROD_ENV_FILE" | awk -F= '{print $2}'`
  if [ -z "$COMMIT" ]; then
    echo "COMMIT key not detected in $PROD_ENV_FILE file. Inserting last commit hash..."
    echo "COMMIT=$LAST_COMMIT" >> $PROD_ENV_FILE
  else
    sed -i.bak "/^COMMIT/s/=.*$/=$LAST_COMMIT/" $PROD_ENV_FILE
  fi
fi

if [ -f "$STAGING_ENV_FILE" ]; then
  COMMIT=`grep "COMMIT" "$STAGING_ENV_FILE" | awk -F= '{print $2}'`
  if [ -z "$COMMIT" ]; then
    echo "COMMIT key not detected in $STAGING_ENV_FILE file. Inserting last commit hash..."
    echo "COMMIT=$LAST_COMMIT" >> $STAGING_ENV_FILE
  else
    sed -i.bak "/^COMMIT/s/=.*$/=$LAST_COMMIT/" $STAGING_ENV_FILE
  fi
fi

find . -name "*.bak" -type f -delete
