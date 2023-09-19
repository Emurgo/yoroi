import {Portfolio} from '@yoroi/types'
import {Cardano} from '@yoroi/wallets'
import BigNumber from 'bignumber.js'

import {COINS_PER_UTXO_WORD} from '../../cardano/constants/common'
import {cardanoValueFromRemoteFormat} from '../../cardano/utils'
import {RawUtxo} from '../../types/other'
import {asQuantity} from '../../utils'
import {CardanoMobile} from '../../wallets'
import {cardanoOnChainMetadataAsBalanceToken} from './transformers'

export async function calcLockedDeposit(utxos: ReadonlyArray<RawUtxo>) {
  // coins-per-utxo-word wrongly set as a constant in the code
  // it should be consumed from the backend along with other protocol parameters
  const coinsPerUtxoWord = await CardanoMobile.BigNum.fromStr(COINS_PER_UTXO_WORD)
  const utxosWithAssets = utxos.filter((utxo) => utxo.assets.length > 0)

  const promises = utxosWithAssets.map((utxo) => {
    return cardanoValueFromRemoteFormat(utxo)
      .then((value) => CardanoMobile.minAdaRequired(value, false, coinsPerUtxoWord))
      .then((minAda) => minAda.toStr())
  })
  const results = await Promise.all(promises)
  const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

  return asQuantity(totalLocked)
}

export const cardanoFallbackTokenAsBalanceToken = (tokenId: Portfolio.TokenInfo['id']): Cardano.Yoroi.PortfolioToken =>
  cardanoOnChainMetadataAsBalanceToken({
    tokenId,
    metadata: undefined,
    kind: 'ft',
  })
