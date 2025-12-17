import {CardanoMobile} from '@yoroi/cardano-wallet'
import {isHex} from '@yoroi/common'
import {Address, Balance, Chain, Portfolio} from '@yoroi/types'

import type {Address as CSLAddress} from '@emurgo/cross-csl-core'

import {cardanoValueFromAmounts} from './cardanoValueFromAmounts'
import {Amounts, Quantities, asQuantity} from './utils/utils'

export const withMinAmounts = async (
  address: Address | string,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
): Promise<Balance.Amounts> => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryTokenInfo)
  const minAmounts = await getMinAmounts(
    address,
    amountsWithPrimaryToken,
    primaryTokenInfo,
    protocolParams,
  )

  return Amounts.map(amountsWithPrimaryToken, (amount) => ({
    ...amount,
    quantity: Quantities.max(
      amount.quantity,
      Amounts.getAmount(minAmounts, amount.tokenId).quantity,
    ),
  }))
}

export const getMinAmounts = async (
  address: Address | string,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
  const addrStr = typeof address === 'string' ? address : address
  let normalizedAddress: CSLAddress | null = null
  try {
    if (CardanoMobile.ByronAddress.isValid(addrStr)) {
      const byronAddr = CardanoMobile.ByronAddress.fromBase58(addrStr)
      normalizedAddress = byronAddr.toAddress()
    } else {
      const isHexAddr = isHex(addrStr)
      normalizedAddress = isHexAddr
        ? CardanoMobile.Address.fromHex(addrStr)
        : CardanoMobile.Address.fromBech32(addrStr)
    }
  } catch (error) {
    throw new Error('getMinAmounts::Error not a valid address')
  }

  if (!normalizedAddress || normalizedAddress.isMalformed())
    throw new Error('getMinAmounts::Error not a valid address')

  // Ensure primary token is included (with 0 if not present)
  const amountsWithPrimary = withPrimaryToken(amounts, primaryTokenInfo)

  const value = cardanoValueFromAmounts(
    CardanoMobile,
    amountsWithPrimary,
    primaryTokenInfo.id,
  )
  const coinsPerUtxoByte = CardanoMobile.BigNum.fromStr(
    protocolParams.coinsPerUtxoByte,
  )

  const txOutput = CardanoMobile.TransactionOutput.new(normalizedAddress, value)
  const dataCost = CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte)

  const minAda = asQuantity(
    CardanoMobile.minAdaForOutput(txOutput, dataCost).toStr(),
  )

  return {
    [primaryTokenInfo.id]: minAda,
  } as Balance.Amounts
}

export const withPrimaryToken = (
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
): Balance.Amounts => {
  if (Amounts.includes(amounts, primaryTokenInfo.id)) return amounts

  return {
    ...amounts,
    [primaryTokenInfo.id]: Quantities.zero,
  }
}
