import BigNumber from 'bignumber.js'

import {NetworkId, RawUtxo} from '../../types/other'
import {CardanoMobile} from '../../wallets'
import {getCardanoNetworkConfigById} from '../networks'
import {cardanoValueFromRemoteFormat} from '../utils'

export async function calcLockedDeposit(utxos: RawUtxo[], networkId: NetworkId) {
  const networkConfig = getCardanoNetworkConfigById(networkId)
  const minUtxoValue = await CardanoMobile.BigNum.fromStr(networkConfig.MINIMUM_UTXO_VAL)
  const utxosWithAssets = utxos.filter((u) => u.assets.length > 0)

  const promises = utxosWithAssets.map((u) => {
    return cardanoValueFromRemoteFormat(u)
      .then((v) => CardanoMobile.minAdaRequired(v, minUtxoValue))
      .then((v) => v.toStr())
  })
  const results = await Promise.all(promises)
  const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

  return totalLocked
}
