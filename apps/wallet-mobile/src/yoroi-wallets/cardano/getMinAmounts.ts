import {BigNum} from '@emurgo/cross-csl-core'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {Balance, Chain, Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Address} from '../types'
import {Amounts, asQuantity, Quantities} from '../utils'
import {CardanoMobile} from '../wallets'
import {cardanoValueFromMultiToken} from './cardanoValueFromMultiToken'
import {MultiToken} from './MultiToken'

export const withMinAmounts = async (
  address: Address,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
): Promise<Balance.Amounts> => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryTokenInfo)
  const minAmounts = await getMinAmounts(address, amountsWithPrimaryToken, primaryTokenInfo, protocolParams)

  return Amounts.map(amountsWithPrimaryToken, (amount) => ({
    ...amount,
    quantity: Quantities.max(amount.quantity, Amounts.getAmount(minAmounts, amount.tokenId).quantity),
  }))
}

export const getMinAmounts = async (
  address: Address,
  amounts: Balance.Amounts,
  primaryTokenInfo: Portfolio.Token.Info,
  protocolParams: Chain.Cardano.ProtocolParams,
) => {
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

  const [value, coinsPerUtxoByte] = await Promise.all([
    cardanoValueFromMultiToken(multiToken),
    CardanoMobile.BigNum.fromStr(protocolParams.coinsPerUtxoByte),
  ])

  const normalizedAddress = await normalizeToAddress(CardanoMobile, address).catch(() => {
    throw new Error('getMinAmounts::Error not a valid address')
  })

  if (normalizedAddress === undefined) throw new Error('getMinAmounts::Error not a valid address')

  const [txOutput, dataCost] = await Promise.all([
    CardanoMobile.TransactionOutput.new(normalizedAddress, value),
    CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte),
  ])

  const minAda = await CardanoMobile.minAdaForOutput(txOutput, dataCost)
    .then((minAda: BigNum) => minAda.toStr())
    .then(asQuantity)

  return {
    [primaryTokenInfo.id]: minAda,
  } as Balance.Amounts
}

export const withPrimaryToken = (amounts: Balance.Amounts, primaryTokenInfo: Portfolio.Token.Info): Balance.Amounts => {
  if (Amounts.includes(amounts, primaryTokenInfo.id)) return amounts

  return {
    ...amounts,
    [primaryTokenInfo.id]: Quantities.zero,
  }
}
