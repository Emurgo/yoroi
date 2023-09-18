import {BigNum} from '@emurgo/cross-csl-core'
import {Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Address, Token} from '../types'
import {Amounts, asQuantity, Quantities} from '../utils'
import {CardanoMobile} from '../wallets'
import {COINS_PER_UTXO_BYTE} from './constants/common'
import {MultiToken} from './MultiToken'
import {cardanoValueFromMultiToken, normalizeToAddress} from './utils'

export const withMinAmounts = async (
  address: Address,
  amounts: Portfolio.Amounts,
  primaryToken: Token,
): Promise<Portfolio.Amounts> => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryToken)
  const minAmounts = await getMinAmounts(address, amountsWithPrimaryToken, primaryToken)

  return Amounts.map(amountsWithPrimaryToken, (amount) => ({
    ...amount,
    quantity: Quantities.max(amount.quantity, Amounts.getAmount(minAmounts, amount.tokenId).quantity),
  }))
}

export const getMinAmounts = async (address: Address, amounts: Portfolio.Amounts, primaryToken: Token) => {
  const multiToken = new MultiToken(
    [
      {identifier: primaryToken.identifier, networkId: primaryToken.networkId, amount: new BigNumber('0')},
      ...Amounts.toArray(amounts).map(({tokenId, quantity}) => ({
        identifier: tokenId,
        networkId: primaryToken.networkId,
        amount: new BigNumber(quantity),
      })),
    ],
    {defaultNetworkId: primaryToken.networkId, defaultIdentifier: primaryToken.identifier},
  )

  const [value, coinsPerUtxoByte, normalizedAddress] = await Promise.all([
    cardanoValueFromMultiToken(multiToken),
    CardanoMobile.BigNum.fromStr(COINS_PER_UTXO_BYTE),
    normalizeToAddress(address),
  ])

  if (normalizedAddress === undefined) throw new Error('getMinAmounts::Error not a valid address')

  const [txOutput, dataCost] = await Promise.all([
    CardanoMobile.TransactionOutput.new(normalizedAddress, value),
    CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte),
  ])

  const minAda = await CardanoMobile.minAdaForOutput(txOutput, dataCost)
    .then((minAda: BigNum) => minAda.toStr())
    .then(asQuantity)

  return {
    [primaryToken.identifier]: minAda,
  } as Portfolio.Amounts
}

export const withPrimaryToken = (amounts: Portfolio.Amounts, primaryToken: Token): Portfolio.Amounts => {
  if (Amounts.includes(amounts, primaryToken.identifier)) return amounts

  return {
    ...amounts,
    [primaryToken.identifier]: Quantities.zero,
  }
}
