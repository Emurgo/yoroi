// @flow

import {Transaction, PublicKey, PrivateKey} from 'react-native-chain-libs'
import {HdWallet} from 'react-native-cardano'
import {BigNumber} from 'bignumber.js'

export async function getTxInputTotal(tx: Transaction): Promise<BigNumber> {
  let sum = new BigNumber(0)

  const inputs = await tx.inputs()
  for (let i = 0; i < (await inputs.size()); i++) {
    const input = await inputs.get(i)
    const value = new BigNumber(await (await input.value()).to_str())
    sum = sum.plus(value)
  }
  return sum
}

export async function getTxOutputTotal(tx: Transaction): Promise<BigNumber> {
  let sum = new BigNumber(0)

  const outputs = await tx.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    const value = new BigNumber(await (await output.value()).to_str())
    sum = sum.plus(value)
  }
  return sum
}

// TODO: test
export const v2SkKeyToV3Key = async (v2Key: HdWallet.XPrv): PrivateKey => {
  return await PrivateKey.from_extended_bytes(
    // need to slice out the chain code from the private key
    Buffer.from(v2Key.slice(0, 128), 'hex'),
  )
}
export const v2PkKeyToV3Key = async (v2Key: HdWallet.XPub): PublicKey => {
  return await PublicKey.from_bytes(
    // need to slice out the chain code from the public key
    Buffer.from(v2Key.slice(0, 64), 'hex'),
  )
}
