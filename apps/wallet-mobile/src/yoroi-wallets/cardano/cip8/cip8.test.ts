import * as cip8 from './cip8'
import {Buffer} from 'buffer'
import {wrappedCsl} from '../wrappedCsl'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import assert from 'assert'
import {getMasterKeyFromMnemonic} from '../byron/util'
import {harden} from '../common/signatureUtils'
import {createRawTxSigningKey} from '../utils'

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
      '845846a201276761646472657373583901260c2a2b09aad0061a320042c15f8985449b9e8d5ced8a45e35b37dd42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40a166686173686564f448776861746576657258406a16fcb9cc6c3f7d83fdd623e8896d4b81c0ef6a9fb68d916794e2e4c3c0766666b485f71c6f1f56241cb30905cc18618c7e95721dba3e91bcd9918f51e8b90a',
    )
  })
})

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')
