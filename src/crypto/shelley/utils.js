// @flow

// TODO
// import {Transaction} from 'react-native-chain-libs'
import {BigNumber} from 'bignumber.js'

export function getTxInputTotal(
  // tx: Transaction,
  tx: any,
): BigNumber {
  let sum = new BigNumber(0)

  const inputs = tx.inputs()
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i)
    const value = new BigNumber(input.value().to_str())
    sum = sum.plus(value)
  }
  return sum
}

export function getTxOutputTotal(
  // tx: Transaction,
  tx: any,
): BigNumber {
  let sum = new BigNumber(0)

  const outputs = tx.outputs()
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i)
    const value = new BigNumber(output.value().to_str())
    sum = sum.plus(value)
  }
  return sum
}
