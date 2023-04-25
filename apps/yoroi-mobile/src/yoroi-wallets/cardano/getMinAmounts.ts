import {BigNum} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {Token, YoroiAmounts} from '../types'
import {Amounts, asQuantity, Quantities} from '../utils'
import {CardanoMobile, cardanoValueFromMultiToken} from '.'
import {MINIMUM_UTXO_VAL} from './constants/common'
import {MultiToken} from './MultiToken'

export const withMinAmounts = async (amounts: YoroiAmounts, primaryToken: Token): Promise<YoroiAmounts> => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryToken)
  const minAmounts = await getMinAmounts(amountsWithPrimaryToken, primaryToken)

  return Amounts.map(amountsWithPrimaryToken, (amount) => ({
    ...amount,
    quantity: Quantities.max(amount.quantity, Amounts.getAmount(minAmounts, amount.tokenId).quantity),
  }))
}

export const getMinAmounts = async (amounts: YoroiAmounts, primaryToken: Token) => {
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

  const [value, minUtxoVal] = await Promise.all([
    cardanoValueFromMultiToken(multiToken),
    CardanoMobile.BigNum.fromStr(MINIMUM_UTXO_VAL),
  ])

  const minAda = await CardanoMobile.minAdaRequired(value, minUtxoVal)
    .then((minAda: BigNum) => minAda.toStr())
    .then(asQuantity)

  return {
    [primaryToken.identifier]: minAda,
  } as YoroiAmounts
}

const withPrimaryToken = (amounts: YoroiAmounts, primaryToken: Token): YoroiAmounts => {
  if (Amounts.includes(amounts, primaryToken.identifier)) return amounts

  return {
    ...amounts,
    [primaryToken.identifier]: Quantities.zero,
  }
}
