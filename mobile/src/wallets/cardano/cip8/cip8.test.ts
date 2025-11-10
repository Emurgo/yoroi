import {normalizeToAddress} from '@yoroi/tx'

import {Buffer} from 'buffer'

import {CardanoMobile} from '~/wallets/wallets'

import {harden} from '../common/signatureUtils'
import {getMasterKeyFromMnemonic} from '../mnemonic/mnemonic'
import {createRawTxSigningKey} from '../utils'
import * as cip8 from './cip8'

describe('CIP8', () => {
  it('should support signing', async () => {
    const bech32 =
      'addr1qynqc23tpx4dqps6xgqy9s2l3xz5fxu734wwmzj9uddn0h2z6epfcukqmswgwwfruxh7gaddv9x0d5awccwahnhwleqqc4zkh4'
    const payload = '48656C6C6F'
    const rootKey = getMasterKeyFromMnemonic(mnemonic)
    const rootKeyHex = Buffer.from(rootKey).toString('hex')
    const path = [harden(1852), harden(1815), harden(0), 0, 0]
    const signingKey = createRawTxSigningKey(rootKeyHex, path, CardanoMobile)

    const payloadInBytes = Buffer.from(payload, 'hex')
    const normalisedAddress = await normalizeToAddress(bech32)
    if (normalisedAddress != null) {
      const coseSign1 = await cip8.sign(
        Buffer.from(normalisedAddress.toHex(), 'hex'),
        signingKey,
        payloadInBytes,
      )
      const signature = Buffer.from(coseSign1.toBytes()).toString('hex')
      expect(signature).toEqual(
        '845846a201276761646472657373583901260c2a2b09aad0061a320042c15f8985449b9e8d5ced8a45e35b37dd42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40a166686173686564f44548656c6c6f58400b6a6aac7a95656ab241bf4dedec8b5ca0d4893747093f3382223b1d2e869de1b6b9809f0b974536b1191b6e193cf4ec5dc506b21b52e6bc5d352f04c60bf30d',
      )
    } else {
      fail()
    }
  })
})

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')
