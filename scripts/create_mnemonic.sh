#!/bin/env node

const {generateMnemonic} = require('bip39');
const crypto = require('crypto');

const MNEMONIC_STRENGTH = 160;
const DUPLICATED_WORDS = /(\b\S+\b)\s+\b\1\b/

let mnemonics = []

function createMnemonicWithDuplicatedWords() {
    do {
        const mnemonic = generateMnemonic(MNEMONIC_STRENGTH, crypto.randomBytes);
        if (mnemonic.match(DUPLICATED_WORDS)) {
            return mnemonic;
        }
    } while (true)
}

// It creates 10 mnemonics with duplicated words
do {
    mnemonics.push(createMnemonicWithDuplicatedWords());
    if (mnemonics.length >= 10) break;
} while (true)

console.log(mnemonics);