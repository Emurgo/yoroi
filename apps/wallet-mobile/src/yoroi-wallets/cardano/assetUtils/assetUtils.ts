import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {PromiseAllLimited} from '@yoroi/common'
import BigNumber from 'bignumber.js'

import {logger} from '../../../kernel/logger/logger'
import {RawUtxo} from '../../types/other'
import {COINS_PER_UTXO_BYTE} from '../constants/common'
import {cardanoValueFromRemoteFormat} from '../utils'
import {wrappedCsl} from '../wrappedCsl'

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
  const cslLocal = wrappedCsl()
  const csl = cslLocal.csl
  const cslProvided = wrappedCsl()
  const result = new BigNumber(0)
  try {
    const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)
    const coinsPerUtxoByte = await csl.BigNum.fromStr(coinsPerUtxoByteStr)
    const dataCost = await csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    const normalizedAddress = await normalizeToAddress(cslProvided.csl, address)
    if (normalizedAddress === undefined) throw new Error('calcLockedDeposit::Error not a valid address')

    const promises = utxosWithAssets.map((u) => {
      return () =>
        cardanoValueFromRemoteFormat(u)
          .then((v) => csl.TransactionOutput.new(normalizedAddress, v))
          .then((txOutput) => csl.minAdaForOutput(txOutput, dataCost))
          .then((m) => m.toStr())
    })
    const results = await PromiseAllLimited(promises, 20)
    const totalLocked = results.reduce((acc, v) => acc.plus(v), result)

    return totalLocked
  } catch (e) {
    logger.error(e as Error, {utxosLength: rawUtxos.length, coinsPerUtxoByteStr})
    return result
  } finally {
    cslProvided.release()
    cslLocal.release()
  }
}
