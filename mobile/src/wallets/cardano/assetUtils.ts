import {isHex} from '@yoroi/common'

import BigNumber from 'bignumber.js'

import {logger} from '~/kernel/logger/logger'

import {RawUtxo} from '../types/other'
import {cardanoValueFromRemoteFormat} from './utils'
import {wrappedCsl} from './wrappedCsl'

// Re-export from assetHelpers to maintain backward compatibility
export {identifierToCardanoAsset} from './assetHelpers'

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
  const result = new BigNumber(0)
  try {
    // Create address within this csl scope to avoid pointer issues
    let normalizedAddress: any
    if (csl.ByronAddress.isValid(address)) {
      const byronAddr = csl.ByronAddress.fromBase58(address)
      normalizedAddress = byronAddr.toAddress()
    } else {
      const isHexAddr = isHex(address)
      normalizedAddress = isHexAddr
        ? csl.Address.fromHex(address)
        : csl.Address.fromBech32(address)
    }

    if (
      normalizedAddress === undefined ||
      normalizedAddress === null ||
      normalizedAddress.isMalformed()
    ) {
      throw new Error('calcLockedDeposit::Error not a valid address')
    }

    const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)
    const coinsPerUtxoByte = csl.BigNum.fromStr(coinsPerUtxoByteStr)
    const dataCost = csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    const results = utxosWithAssets.map((u, index) => {
      try {
        const value = cardanoValueFromRemoteFormat(u, csl)
        if (!value) {
          throw new Error('cardanoValueFromRemoteFormat returned null value')
        }
        const txOutput = csl.TransactionOutput.new(normalizedAddress, value)
        if (!txOutput) {
          throw new Error('TransactionOutput.new returned null')
        }
        const minAda = csl.minAdaForOutput(txOutput, dataCost)
        return minAda.toStr()
      } catch (error) {
        logger.error(error as Error, {
          utxoIndex: index,
          utxoAmount: u.amount,
          utxoAssetsCount: u.assets.length,
          utxoReceiver: u.receiver,
          txHash: u.tx_hash,
          txIndex: u.tx_index,
        })
        // Return '0' for this UTXO to continue processing others
        return '0'
      }
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
    cslLocal.release()
  }
}
