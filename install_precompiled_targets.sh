#!/bin/bash

# -a ./node_modules/react-native-cardano/rust/target 
if [ -d ./node_modules/node-cardano-wallet/native/target -a -d ./node_modules/react-native-cardano/rust/target ]
then
    tar -xvf ./precompiled-targets/ios_and_android.zip -C ./node_modules/node-cardano-wallet/native/target
    tar -xvf ./precompiled-targets/ios_and_android.zip -C ./node_modules/react-native-cardano/rust/target
else
	echo "You need to run yarn install first"
fi
