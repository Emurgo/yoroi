#!/bin/bash

ENDPOINT=https://faucet.alonzo-purple.dev.cardano.org/send-money/

if [ -z "$1" ]
  then
    echo "You must provide the wallet address"
    exit 1
fi

ADDRESS=$1
QS=$ADDRESS

if [ "$2" ]
  then
    KEY=$2
    QS=$QS?apiKey=$KEY
fi

curl -XPOST "$ENDPOINT$QS"
