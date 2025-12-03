import {RawUtxo} from '@yoroi/api'
import {normalizeToAddress} from '@yoroi/tx'

import {Address} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {getLogger} from '@yoroi/common'

import {cardanoValueFromRemoteFormat} from './utils'
import {wrappedCsl} from './wrappedCsl'

// Re-export from assetHelpers to maintain backward compatibility
export {identifierToCardanoAsset} from './assetHelpers'

/**
 * Calculates the total locked deposit (minimum ADA) required for UTXOs containing assets.
 *
 * According to Cardano protocol (CIP-1852, Cardano Ledger specifications):
 * - Minimum ADA = UTxO Size in Bytes × coinsPerUtxoByte
 * - The UTxO size includes the address, so we must use the actual receiver address
 *   from each UTXO, not a placeholder, as different address types have different sizes.
 *
 * This matches the Cardano standard implementation used in yoroi-lib and other Cardano tools.
 */
export async function calcLockedDeposit({
  rawUtxos,
  coinsPerUtxoByteStr,
}: {
  rawUtxos: RawUtxo[]
  coinsPerUtxoByteStr: string
}) {
  const cslLocal = wrappedCsl()
  const csl = cslLocal.csl
  const result = new BigNumber(0)
  try {
    const utxosWithAssets = rawUtxos.filter((u) => u.assets.length > 0)
    const coinsPerUtxoByte = csl.BigNum.fromStr(coinsPerUtxoByteStr)
    const dataCost = csl.DataCost.newCoinsPerByte(coinsPerUtxoByte)

    const results = utxosWithAssets.map((u, index) => {
      try {
        // Use the actual receiver address from each UTXO, not a placeholder
        // This is critical because address size affects UTxO size calculation
        const receiverAddress = u.receiver
        if (!receiverAddress) {
          throw new Error('UTXO missing receiver address')
        }

        // Normalize address using tx package utility (supports Byron, hex, and bech32)
        const normalizedAddress: Address | undefined = normalizeToAddress(
          csl,
          receiverAddress,
        )

        if (!normalizedAddress || normalizedAddress.isMalformed()) {
          throw new Error(
            `calcLockedDeposit::Invalid receiver address: ${receiverAddress}`,
          )
        }

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
        getLogger().error(error as Error, {
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
    getLogger().error(e as Error, {
      utxosLength: rawUtxos.length,
      coinsPerUtxoByteStr,
    })
    return result
  } finally {
    cslLocal.release()
  }
}
