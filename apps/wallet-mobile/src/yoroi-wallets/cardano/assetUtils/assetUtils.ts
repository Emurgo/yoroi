import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import BigNumber from 'bignumber.js'

import {Address} from '../../types'
import {RawUtxo} from '../../types/other'
import {CardanoMobile} from '../../wallets'
import {COINS_PER_UTXO_BYTE} from '../constants/common'
import {cardanoValueFromRemoteFormat} from '../utils'

export async function calcLockedDeposit(utxos: RawUtxo[], address: Address, coinsPerUtxoByteStr: string) {
  const utxosWithAssets = utxos.filter((u) => u.assets.length > 0)

  const coinsPerUtxoByte = await CardanoMobile.BigNum.fromStr(coinsPerUtxoByteStr ?? COINS_PER_UTXO_BYTE)
  const dataCost = await CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte)
  const normalizedAddress = await normalizeToAddress(CardanoMobile, address)
  if (normalizedAddress === undefined) throw new Error('calcLockedDeposit::Error not a valid address')

  const promises = utxosWithAssets.map((u) => {
    return cardanoValueFromRemoteFormat(u)
      .then((v) => CardanoMobile.TransactionOutput.new(normalizedAddress, v))
      .then((txOutput) => CardanoMobile.minAdaForOutput(txOutput, dataCost))
      .then((m) => m.toStr())
  })
  const results = await Promise.all(promises)
  const totalLocked = results.reduce((acc, v) => acc.plus(v), new BigNumber(0))

  return totalLocked
}
