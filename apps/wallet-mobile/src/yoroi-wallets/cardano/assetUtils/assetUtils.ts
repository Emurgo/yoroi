import BigNumber from 'bignumber.js'

import {RawUtxo} from '../../types/other'
import {CardanoMobile} from '../../wallets'
import {COINS_PER_UTXO_BYTE} from '../constants/common'
import {cardanoValueFromRemoteFormat, normalizeToAddress} from '../utils'

const addressPlaceholder =
  'addr1qx8nuj8a7gy8kes4pedpfdscrlxr6p8gkzyzmhdmsf4209xssydveuc8xyx4zh27fwcmr62mraeezjwf24hzkyejwfmqmpfpy5'

export async function calcLockedDeposit({
  rawUtxos,
  address = addressPlaceholder,
  coinsPerUtxoByteStr = COINS_PER_UTXO_BYTE,
}: {
  rawUtxos: RawUtxo[]
  address?: string
  coinsPerUtxoByteStr?: string
}) {
  const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)

  const coinsPerUtxoByte = await CardanoMobile.BigNum.fromStr(coinsPerUtxoByteStr)
  const dataCost = await CardanoMobile.DataCost.newCoinsPerByte(coinsPerUtxoByte)
  const normalizedAddress = await normalizeToAddress(address)
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
