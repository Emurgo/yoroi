// @flow

import {BigNumber} from 'bignumber.js'

import {
  AccountBindingSignature,
  Certificate,
  InputOutput,
  Fee,
  PayloadAuthData,
  PerCertificateFee,
  // CertificateKind
  StakeDelegationAuthData,
  Value,
} from 'react-native-chain-libs'
import {CertificateKind} from '../certificateUtils'
import {NUMBERS} from '../../../config/numbers'
import {NETWORKS} from '../../../config/networks'
import {AMOUNT_FORMAT} from '../../../types/HistoryTransaction'

import type {
  BaseSignRequest,
  AmountFormat,
} from '../../../types/HistoryTransaction'

const CONFIG = NETWORKS.JORMUNGANDR

export const getTxInputTotal = async (
  IOs: InputOutput,
  format?: AmountFormat = AMOUNT_FORMAT.LOVELACE,
): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const inputs = await IOs.inputs()
  for (let i = 0; i < (await inputs.size()); i++) {
    const input = await inputs.get(i)
    const value = new BigNumber(await (await input.value()).to_str())
    sum = sum.plus(value)
  }
  if (format === AMOUNT_FORMAT.ADA) {
    return sum.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
  }
  return sum
}

export const getTxOutputTotal = async (
  IOs: InputOutput,
  format?: AmountFormat = AMOUNT_FORMAT.LOVELACE,
): Promise<BigNumber> => {
  let sum = new BigNumber(0)

  const outputs = await IOs.outputs()
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    const value = new BigNumber(await (await output.value()).to_str())
    sum = sum.plus(value)
  }
  if (format === AMOUNT_FORMAT.ADA) {
    return sum.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
  }
  return sum
}

export const getShelleyTxFee = async (
  IOs: InputOutput,
  format?: AmountFormat = AMOUNT_FORMAT.LOVELACE,
): Promise<BigNumber> => {
  const out = await getTxOutputTotal(IOs)
  const ins = await getTxInputTotal(IOs)
  const result = ins.minus(out)
  if (format === AMOUNT_FORMAT.ADA) {
    return result.shiftedBy(-NUMBERS.DECIMAL_PLACES_IN_ADA)
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

export const generateAuthData = async (
  bindingSignature: AccountBindingSignature,
  certificate: Certificate,
): Promise<PayloadAuthData> => {
  if (certificate == null) {
    return await PayloadAuthData.for_no_payload()
  }

  switch (await certificate.get_type()) {
    // TODO: update to CertificateKind.StakeDelegation from react-native-chain-libs
    case CertificateKind.StakeDelegation: {
      return await PayloadAuthData.for_stake_delegation(
        await StakeDelegationAuthData.new(bindingSignature),
      )
    }
    default:
      throw new Error(
        `generateAuthData unexpected cert type ${await certificate.get_type()}`,
      )
  }
}

export const generateFee = async (): Promise<Fee> => {
  const perCertificate = await PerCertificateFee.new()
  const genesisPerCert = CONFIG.LINEAR_FEE.PER_CERTIFICATE_FEES
  if (genesisPerCert) {
    if (genesisPerCert.CERTIFICATE_POOL_REGISTRATION != null) {
      await perCertificate.set_pool_registration(
        await Value.from_str(genesisPerCert.CERTIFICATE_POOL_REGISTRATION),
      )
    }
    if (genesisPerCert.CERTIFICATE_STAKE_DELEGATION != null) {
      await perCertificate.set_stake_delegation(
        await Value.from_str(genesisPerCert.CERTIFICATE_STAKE_DELEGATION),
      )
    }
    // $FlowFixMe TODO: currently this property is not defined in config
    if (genesisPerCert.CERTIFICATE_OWNER_STAKE_DELEGATION != null) {
      await perCertificate.set_owner_stake_delegation(
        await Value.from_str(genesisPerCert.CERTIFICATE_OWNER_STAKE_DELEGATION),
      )
    }
  }

  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.LINEAR_FEE.CONSTANT),
    await Value.from_str(CONFIG.LINEAR_FEE.COEFFICIENT),
    await Value.from_str(CONFIG.LINEAR_FEE.CERTIFICATE),
    perCertificate,
  )

  return feeAlgorithm
}
