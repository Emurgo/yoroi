// @flow

import {
  InputOutput,
  StakeDelegation,
  StakeDelegationAuthData,
} from 'react-native-chain-libs'

import {BigNumber} from 'bignumber.js'

export const getTxInputTotal = async (IOs: InputOutput): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const inputs = await IOs.inputs()
  for (let i = 0; i < (await inputs.size()); i++) {
    const input = await inputs.get(i)
    const value = new BigNumber(await (await input.value()).to_str())
    sum = sum.plus(value)
  }
  return sum
}

export const getTxOutputTotal = async (
  IOs: InputOutput,
): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const outputs = await IOs.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    const value = new BigNumber(await (await output.value()).to_str())
    sum = sum.plus(value)
  }
  return sum
}

export const generateAuthData = async (
  bindingSignature: AccountBindingSignature,
  certificate: Certificate,
): Promise<PayloadAuthData> => {
  if (certificate == null) {
    return await PayloadAuthData.for_no_payload()
  }

  switch (await certificate.get_type()) {
    // TODO: maybe should be `await CertificateKind.StakeDelegation`
    case StakeDelegation: {
      return await PayloadAuthData.for_stake_delegation(
        await StakeDelegationAuthData.new(bindingSignature),
      )
    }
    default:
      throw new Error(
        `generateAuthData unexptected cert type ${await certificate.get_type()}`,
      )
  }
}
