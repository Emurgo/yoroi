// @flow

import {Transaction} from 'react-native-chain-libs'
import {BigNumber} from 'bignumber.js'

export async function getTxInputTotal(tx: Transaction): Promise<BigNumber> {
  let sum = new BigNumber(0)

  const inputs = await tx.inputs()
  for (let i = 0; i < (await inputs.size()); i++) {
    const input = await inputs.get(i)
    // todo: input.value() not yet implemented
    const value = new BigNumber(input.value().to_str())
    sum = sum.plus(value)
  }
  return sum
}

export async function getTxOutputTotal(tx: Transaction): Promise<BigNumber> {
  let sum = new BigNumber(0)

  const outputs = await tx.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = outputs.get(i)
    // todo: input.value() not yet implemented
    const value = new BigNumber(output.value().to_str())
    sum = sum.plus(value)
  }
  return sum
}
