import {isHex} from '@yoroi/common'
import {Balance, Chain, Portfolio} from '@yoroi/types'

import {Address} from '../types/yoroi'
import {Amounts, Quantities, asQuantity} from '../utils/utils'
import {cardanoValueFromAmounts} from './cardanoValueFromAmounts'
import {CardanoMobileWrapped} from './wrappedCsl'

export const withMinAmounts = async (
  address: Address,
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
  address: Address,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
  return CardanoMobileWrapped.cslScope((csl) => {
    // Create address within this cslScope to avoid pointer issues
    let normalizedAddress: any
    if (csl.ByronAddress.isValid(address)) {
      const byronAddr = csl.ByronAddress.fromBase58(address)
      normalizedAddress = byronAddr.toAddress()
    } else {
      const isHexAddr = isHex(address)
      normalizedAddress = isHexAddr
        ? csl.Address.fromHex(address)
        : csl.Address.fromBech32(address)
    }

    if (!normalizedAddress || normalizedAddress.isMalformed())
      throw new Error('getMinAmounts::Error not a valid address')

    // Ensure primary token is included (with 0 if not present)
    const amountsWithPrimary = withPrimaryToken(amounts, primaryTokenInfo)

    const value = cardanoValueFromAmounts(
      csl,
      amountsWithPrimary,
      primaryTokenInfo.id,
    )
    const coinsPerUtxoByte = csl.BigNum.fromStr(protocolParams.coinsPerUtxoByte)

    const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
    const dataCost = csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    const minAda = asQuantity(csl.minAdaForOutput(txOutput, dataCost).toStr())

    return {
      [primaryTokenInfo.id]: minAda,
    } as Balance.Amounts
  })
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
