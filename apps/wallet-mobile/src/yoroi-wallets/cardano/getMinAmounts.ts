import {BigNum} from '@emurgo/cross-csl-core'
import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Address, Token} from '../types'
import {Amounts, asQuantity, Quantities} from '../utils'
import {CardanoMobile} from '../wallets'
import {COINS_PER_UTXO_BYTE} from './constants/common'
import {MultiToken} from './MultiToken'
import {cardanoValueFromMultiToken} from './utils'

export const withMinAmounts = async (
  address: Address,
  amounts: Balance.Amounts,
  primaryToken: Token,
): Promise<Balance.Amounts> => {
  const amountsWithPrimaryToken = withPrimaryToken(amounts, primaryToken)
  const minAmounts = await getMinAmounts(address, amountsWithPrimaryToken, primaryToken)

  return Amounts.map(amountsWithPrimaryToken, (amount) => ({
    ...amount,
    quantity: Quantities.max(amount.quantity, Amounts.getAmount(minAmounts, amount.tokenId).quantity),
  }))
}

export const getMinAmounts = async (address: Address, amounts: Balance.Amounts, primaryToken: Token) => {
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

  const [value, coinsPerUtxoByte, bech32Aaddress] = await Promise.all([
    cardanoValueFromMultiToken(multiToken),
    CardanoMobile.BigNum.fromStr(COINS_PER_UTXO_BYTE),
    (await CardanoMobile.ByronAddress.isValid(address))
      ? await (await CardanoMobile.ByronAddress.fromBase58(address)).toAddress()
      : await CardanoMobile.Address.fromBech32(address),
  ])

  const [txOutput, dataCost] = await Promise.all([
    CardanoMobile.TransactionOutput.new(bech32Aaddress, value),
    CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte),
  ])

  const minAda = await CardanoMobile.minAdaForOutput(txOutput, dataCost)
    .then((minAda: BigNum) => minAda.toStr())
    .then(asQuantity)

  return {
    [primaryToken.identifier]: minAda,
  } as Balance.Amounts
}

const withPrimaryToken = (amounts: Balance.Amounts, primaryToken: Token): Balance.Amounts => {
  if (Amounts.includes(amounts, primaryToken.identifier)) return amounts

  return {
    ...amounts,
    [primaryToken.identifier]: Quantities.zero,
  }
}
