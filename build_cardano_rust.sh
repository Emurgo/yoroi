#! /bin/bash

git submodule update --init --recursive && \
cd vendor/js-cardano-wasm && \
npm install && \
./build && \
npm link && \
git checkout . && \
cd .. && \
npm link rust-cardano-crypto