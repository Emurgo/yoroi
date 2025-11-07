import {Balance, Chain, Portfolio} from '@yoroi/types'

// TODO: REVISIT this is not exported from yoroi-lib
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import BigNumber from 'bignumber.js'

import {Address} from '../types/yoroi'
import {Amounts, Quantities, asQuantity} from '../utils/utils'
import {MultiToken} from './MultiToken'
import {cardanoValueFromMultiToken} from './cardanoValueFromMultiToken'
import {CardanoMobileWrapped} from './wrappedCsl'

export const withMinAmounts = (
  address: Address,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
): Balance.Amounts => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryTokenInfo)
  const minAmounts = getMinAmounts(
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

export const getMinAmounts = (
  address: Address,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const multiToken = new MultiToken(
      [
        {identifier: primaryTokenInfo.id, amount: new BigNumber('0')},
        ...Amounts.toArray(amounts).map(({tokenId, quantity}) => ({
          identifier: tokenId,
          amount: new BigNumber(quantity),
        })),
      ],
      {defaultIdentifier: primaryTokenInfo.id},
    )

    const value = cardanoValueFromMultiToken(multiToken, csl)
    const coinsPerUtxoByte = csl.BigNum.fromStr(protocolParams.coinsPerUtxoByte)

    const normalizedAddress = normalizeToAddress(csl, address)

    if (normalizedAddress === undefined)
      throw new Error('getMinAmounts::Error not a valid address')

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
