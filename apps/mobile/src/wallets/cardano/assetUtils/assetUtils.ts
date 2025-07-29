import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import BigNumber from 'bignumber.js'

import {RawUtxo} from '@yoroi/types'
import {logger} from '~/kernel/logger/logger'
import {cardanoValueFromRemoteFormat} from '../utils'
import {wrappedCsl} from '../wrappedCsl'

const addressPlaceholder =
  'addr1qx8nuj8a7gy8kes4pedpfdscrlxr6p8gkzyzmhdmsf4209xssydveuc8xyx4zh27fwcmr62mraeezjwf24hzkyejwfmqmpfpy5'

export async function calcLockedDeposit({
  rawUtxos,
  address = addressPlaceholder,
  coinsPerUtxoByteStr,
}: {
  rawUtxos: RawUtxo[]
  address?: string
  coinsPerUtxoByteStr: string
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
    if (normalizedAddress === undefined)
      throw new Error('calcLockedDeposit::Error not a valid address')

    const results = utxosWithAssets.map((u) => {
      const value = cardanoValueFromRemoteFormat(u)
      const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
      const minAda = csl.minAdaForOutput(txOutput, dataCost)
      return minAda.toStr()
    })

    const totalLocked = results.reduce((acc, v) => acc.plus(v), result)

    return totalLocked
  } catch (e) {
    logger.error(e as Error, {
      utxosLength: rawUtxos.length,
      coinsPerUtxoByteStr,
    })
    return result
  } finally {
    cslProvided.release()
    cslLocal.release()
  }
}
