import BigNumber from 'bignumber.js'

import {getCardanoNetworkConfigById} from '../../src/legacy/networks'
import {NetworkId, RawUtxo} from '../../src/legacy/types'
import {cardanoValueFromRemoteFormat} from '../../src/legacy/utils'
import {CardanoMobile} from '.'

export async function calcLockedDeposit(utxos: RawUtxo[], networkId: NetworkId) {
  const networkConfig = getCardanoNetworkConfigById(networkId)
  const minUtxoValue = await CardanoMobile.BigNum.fromStr(networkConfig.MINIMUM_UTXO_VAL)
  const utxosWithAssets = utxos.filter((u) => u.assets.length > 0)

  const promises = utxosWithAssets.map(async (u) => {
    return cardanoValueFromRemoteFormat(u)
      .then((v) => CardanoMobile.minAdaRequired(v, minUtxoValue))
      .then((v) => v.toStr())
  })
  const results = await Promise.all(promises)
  const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

  return totalLocked
}
