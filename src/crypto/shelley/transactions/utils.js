// @flow

import {
  AccountBindingSignature,
  Certificate,
  InputOutput,
  PayloadAuthData,
  StakeDelegation,
  StakeDelegationAuthData,
} from 'react-native-chain-libs'
import type {BaseSignRequest} from '../../../types/HistoryTransaction'
import {CONFIG} from '../../../config'

import {BigNumber} from 'bignumber.js'

export const getTxInputTotal = async (
  IOs: InputOutput,
  shift: boolean,
): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const inputs = await IOs.inputs()
  for (let i = 0; i < (await inputs.size()); i++) {
    const input = await inputs.get(i)
    const value = new BigNumber(await (await input.value()).to_str())
    sum = sum.plus(value)
  }
  if (shift) {
    return sum.shiftedBy(-CONFIG.DECIMAL_PLACES_IN_ADA)
  }
  return sum
}

export const getTxOutputTotal = async (
  IOs: InputOutput,
  shift: boolean,
): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const outputs = await IOs.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    const value = new BigNumber(await (await output.value()).to_str())
    sum = sum.plus(value)
  }
  if (shift) {
    return sum.shiftedBy(-CONFIG.DECIMAL_PLACES_IN_ADA)
  }
  return sum
}

export const getShelleyTxFee = async (
  IOs: InputOutput,
  shift: boolean,
): Promise<BigNumber> => {
  const out = await getTxOutputTotal(IOs, false)
  const ins = await getTxInputTotal(IOs, false)
  const result = ins.minus(out)
  if (shift) {
    return result.shiftedBy(-CONFIG.DECIMAL_PLACES_IN_ADA)
  }
  return result
}

export const getShelleyTxReceivers = async (
  signRequest: BaseSignRequest<InputOutput>,
  includeChange: boolean,
): Promise<Array<string>> => {
  const receivers: Array<string> = []

  const changeAddrs = new Set(
    signRequest.changeAddr.map((change) => change.address),
  )
  const outputs = await signRequest.unsignedTx.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    const addr = Buffer.from(
      await (await output.address()).as_bytes(),
    ).toString('hex')
    if (!includeChange) {
      if (changeAddrs.has(addr)) {
        continue
      }
    }
    receivers.push(addr)
  }
  return receivers
}

export const shelleyTxEqual = async (
  req1: InputOutput,
  req2: InputOutput,
): Promise<boolean> => {
  const inputs1 = await req1.inputs()
  const inputs2 = await req2.inputs()
  if ((await inputs1.size()) !== (await inputs2.size())) {
    return false
  }

  const outputs1 = await req1.outputs()
  const outputs2 = await req2.outputs()
  if ((await outputs1.size()) !== (await outputs2.size())) {
    return false
  }

  for (let i = 0; i < (await inputs1.size()); i++) {
    const input1 = Buffer.from(
      await (await inputs1.get(i)).as_bytes(),
    ).toString('hex')
    const input2 = Buffer.from(
      await (await inputs2.get(i)).as_bytes(),
    ).toString('hex')
    if (input1 !== input2) {
      return false
    }
  }
  for (let i = 0; i < (await outputs1.size()); i++) {
    const output1 = await outputs1.get(i)
    const output2 = await outputs2.get(i)

    if (
      (await (await output1.value()).to_str()) !==
      (await (await output2.value()).to_str())
    ) {
      return false
    }
    const out1Addr = Buffer.from(
      await (await output1.address()).as_bytes(),
    ).toString('hex')
    const out2Addr = Buffer.from(
      await (await output2.address()).as_bytes(),
    ).toString('hex')
    if (out1Addr !== out2Addr) {
      return false
    }
  }

  return true
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
