import BigNumber from 'bignumber.js'

import {getCardanoNetworkConfigById} from '../../legacy/networks'
import {NetworkId, RawUtxo} from '../../legacy/types'
import {cardanoValueFromRemoteFormat} from '../../legacy/utils'
import {BigNum, minAdaRequired} from '../index'

export async function calcLockedDeposit(utxos: RawUtxo[], networkId: NetworkId) {
  const networkConfig = getCardanoNetworkConfigById(networkId)
  const minUtxoValue = await BigNum.fromStr(networkConfig.MINIMUM_UTXO_VAL)
  const utxosWithAssets = utxos.filter((u) => u.assets.length > 0)

  const promises = utxosWithAssets.map(async (u) => {
    return cardanoValueFromRemoteFormat(u)
      .then((v) => minAdaRequired(v, minUtxoValue))
      .then((v) => v.toStr())
  })
  const results = await Promise.all(promises)
  const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

  return totalLocked
}
