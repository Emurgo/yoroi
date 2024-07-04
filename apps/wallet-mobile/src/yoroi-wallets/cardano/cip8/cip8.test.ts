import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import assert from 'assert'
import {Buffer} from 'buffer'

import {harden} from '../common/signatureUtils'
import {getMasterKeyFromMnemonic} from '../mnemonic/mnemonic'
import {createRawTxSigningKey} from '../utils'
import {wrappedCsl} from '../wrappedCsl'
import * as cip8 from './cip8'

describe('CIP8', () => {
  it('should support signing', async () => {
    const {csl} = wrappedCsl()
    const bech32 =
      'addr1qynqc23tpx4dqps6xgqy9s2l3xz5fxu734wwmzj9uddn0h2z6epfcukqmswgwwfruxh7gaddv9x0d5awccwahnhwleqqc4zkh4'
    const payload = 'whatever'
    const rootKey = await getMasterKeyFromMnemonic(mnemonic)
    const path = [harden(1852), harden(1815), harden(0), 0, 0]
    const signingKey = await createRawTxSigningKey(rootKey, path)

    const payloadInBytes = Buffer.from(payload, 'utf-8')
    const normalisedAddress = await normalizeToAddress(csl, bech32)
    assert(normalisedAddress != null)
    const coseSign1 = await cip8.sign(Buffer.from(await normalisedAddress.toHex(), 'hex'), signingKey, payloadInBytes)
    const signature = Buffer.from(await coseSign1.toBytes()).toString('hex')
    expect(signature).toEqual(
      '845846a201276761646472657373583901260c2a2b09aad0061a320042c15f8985449b9e8d5ced8a45e35b37dd42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40a166686173686564f44058409e29106b0f414b41631b42b31229be1c3f693660170603b26c5fac034282607e87aba4a9eab3c7b3dc9ad104898ac76b6c89fff80536c720f9bf3133da1e9804',
    )
  })
})

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')
