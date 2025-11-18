import {
  RemoteCertificateMeta,
  StakePoolInfoRequest,
  StakePoolInfosAndHistories,
} from '@yoroi/staking'
import {Portfolio} from '@yoroi/types'

import _ from 'lodash'

import {
  AccountStateRequest,
  AccountStateResponse,
  RawTransaction,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
  TxSubmissionStatus,
} from '~/wallets/types/other'

import {handleError} from './errors'
import {fetchDefault} from './fetch'
import * as legacyOnly from './legacy-api'
import * as legacyFallback from './legacy-api/fallback'
import {getBackendZeroUrl} from './wallet-registration'

type Addresses = Array<string>

const limitApiRecords = 50

/**
 * LEGACY ONLY: Re-export from legacy-api
 * See legacy-api/index.ts for details
 */
export const checkServerStatus = legacyOnly.checkServerStatus

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /bestblock
 *
 * Uses backend-zero endpoint. Maps response to legacy TipStatusResponse format.
 * No fallback to legacy API - backend-zero is the only source.
 */
export const getTipStatus = async (
  baseApiUrl: string,
): Promise<TipStatusResponse> => {
  const backendZeroUrl = getBackendZeroUrl(baseApiUrl)
  const bestBlock = await fetchDefault<{
    hash: string
    height: number
    epoch: number
    slot: number
    globalSlot: number
  }>('bestblock', null, backendZeroUrl, 'GET')

  // Map to legacy format (both safeBlock and bestBlock use same data)
  const blockResponse = {
    height: bestBlock.height,
    epoch: bestBlock.epoch,
    slot: bestBlock.slot,
    hash: bestBlock.hash,
    globalSlot: bestBlock.globalSlot,
  }

  return {
    safeBlock: blockResponse,
    bestBlock: blockResponse,
  }
}

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /wallets/{id}/transactions
 *
 * Uses backend-zero when wallet context is provided.
 * ⚠️ FALLBACK: Falls back to legacy API (POST /v2/txs/history) if:
 *   - Wallet context not provided
 *   - Backend-zero request fails
 *
 * See legacy-api/fallback.ts for fallback implementation.
 */
export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  baseApiUrl: string,
  walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  },
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  // If wallet context provided, use backend-zero
  if (walletContext) {
    const backendZeroUrl = getBackendZeroUrl(baseApiUrl)

    // Ensure wallet is registered
    const {
      registerWallet,
      getWalletRegistrationDataFromContext,
      convertWalletIdToEd25519KeyHash,
    } = await import('./wallet-registration')
    const registrationData = getWalletRegistrationDataFromContext({
      walletId: walletContext.walletId,
      publicKeyHex: walletContext.publicKeyHex,
      accountPubKeyHex: walletContext.accountPubKeyHex,
      paymentKeyHashes: walletContext.paymentKeyHashes,
      rewardAddresses: walletContext.rewardAddresses,
    })

    if (registrationData) {
      await registerWallet(registrationData, backendZeroUrl)
    }

    // Always use converted wallet ID (Ed25519KeyHash format) for API calls
    const backendWalletId =
      registrationData?.id ||
      convertWalletIdToEd25519KeyHash(
        walletContext.walletId,
        walletContext.accountPubKeyHex,
      )

    // Build cursor query parameters
    let url = `${backendZeroUrl}/wallets/${backendWalletId}/transactions`
    if (request.after) {
      const params = new URLSearchParams({
        block: request.after.block,
        tx: request.after.tx,
      })
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })

    if (!response.ok) {
      // ⚠️ FALLBACK: Backend-zero failed, use legacy API
      return legacyFallback.fetchNewTxHistoryLegacy(request, baseApiUrl)
    }

    const backendTxs = (await response.json()) as Array<{
      hash: string
      block: string
      inputs: Array<{
        txHash: string
        index: number
        source: {
          amount: Record<string, string>
          address: string
          index: number
          datumHash?: string
        }
      }>
      outputs: Array<{
        amount: Record<string, string>
        address: string
        index: number
        datumHash?: string
      }>
      fee: Record<string, string>
      certificates: unknown[]
      withdrawals: unknown[]
      when: string
    }>

    // Map backend-zero Tx format to RawTransaction format (simplified)
    const transactions: RawTransaction[] = backendTxs.map((tx) => ({
      type: 'shelley' as const, // Backend-zero transactions are all shelley-era
      hash: tx.hash || '',
      // Ensure block_hash is undefined if block is missing/empty (for pending txs)
      block_hash: tx.block && tx.block.trim() ? tx.block : undefined,
      block_num: undefined, // Not available in backend-zero response
      time: new Date(tx.when).toISOString(),
      tx_state: tx.block ? 'Successful' : 'Pending',
      last_update: new Date(tx.when).toISOString(),
      tx_ordinal: undefined, // Not available
      inputs: tx.inputs.map((input) => ({
        address: input.source.address,
        amount: String(input.source.amount.$lovelaces || '0'),
        assets: Object.entries(input.source.amount)
          .filter(([key]) => key !== '$lovelaces')
          .map(([assetId, amount]) => {
            const [policyId = '', nameHex = ''] = assetId.split('.')
            // Ensure amount is a valid string - handle undefined/null/numbers
            const amountStr =
              amount == null
                ? '0'
                : typeof amount === 'string'
                  ? amount
                  : typeof amount === 'number' || typeof amount === 'bigint'
                    ? String(amount)
                    : '0'
            return {
              tokenId: assetId as Portfolio.Token.Id,
              policyId,
              name: nameHex,
              amount: amountStr,
            }
          }),
        id: `${input.txHash}${input.index}`,
        index: input.index,
        txHash: input.txHash,
      })),
      outputs: tx.outputs.map((output) => ({
        address: output.address,
        amount: String(output.amount.$lovelaces || '0'),
        assets: Object.entries(output.amount)
          .filter(([key]) => key !== '$lovelaces')
          .map(([assetId, amount]) => {
            const [policyId = '', nameHex = ''] = assetId.split('.')
            // Ensure amount is a valid string - handle undefined/null/numbers
            const amountStr =
              amount == null
                ? '0'
                : typeof amount === 'string'
                  ? amount
                  : typeof amount === 'number' || typeof amount === 'bigint'
                    ? String(amount)
                    : '0'
            return {
              tokenId: assetId as Portfolio.Token.Id,
              policyId,
              name: nameHex,
              amount: amountStr,
            }
          }),
      })),
      fee: String(tx.fee.$lovelaces || '0'),
      certificates: tx.certificates as Array<RemoteCertificateMeta>,
      withdrawals: (tx.withdrawals || []).map((w: any) => ({
        address: w.address || '',
        // Backend-zero withdrawals have amount as { $lovelaces: string }
        amount:
          typeof w.amount === 'object' && w.amount?.$lovelaces != null
            ? String(w.amount.$lovelaces)
            : typeof w.amount === 'string'
              ? w.amount
              : typeof w.amount === 'number' || typeof w.amount === 'bigint'
                ? String(w.amount)
                : '0',
      })),
    }))

    // Determine isLast: if response length < limitApiRecords, it's the last page
    return {
      transactions,
      isLast: transactions.length < limitApiRecords,
    }
  }

  // ⚠️ FALLBACK: No wallet context, use legacy API
  return legacyFallback.fetchNewTxHistoryLegacy(request, baseApiUrl)
}

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /wallets/{id}/paymentkeyhashes?used=true
 *
 * Uses backend-zero when wallet context is provided.
 * ⚠️ FALLBACK: Falls back to legacy API (POST /v2/addresses/filterUsed) if:
 *   - Wallet context not provided
 *   - Backend-zero request fails
 *
 * See legacy-api/fallback.ts for fallback implementation.
 */
export const filterUsedAddresses = async (
  addresses: Addresses,
  baseApiUrl: string,
  walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  },
): Promise<Addresses> => {
  // If wallet context provided, use backend-zero
  if (walletContext) {
    const backendZeroUrl = getBackendZeroUrl(baseApiUrl)

    // Ensure wallet is registered
    const {
      registerWallet,
      getWalletRegistrationDataFromContext,
      convertWalletIdToEd25519KeyHash,
    } = await import('./wallet-registration')
    const registrationData = getWalletRegistrationDataFromContext({
      walletId: walletContext.walletId,
      publicKeyHex: walletContext.publicKeyHex,
      accountPubKeyHex: walletContext.accountPubKeyHex,
      paymentKeyHashes: walletContext.paymentKeyHashes,
      rewardAddresses: walletContext.rewardAddresses,
    })

    if (registrationData) {
      await registerWallet(registrationData, backendZeroUrl)
    }

    // Always use converted wallet ID (Ed25519KeyHash format) for API calls
    const backendWalletId =
      registrationData?.id ||
      convertWalletIdToEd25519KeyHash(
        walletContext.walletId,
        walletContext.accountPubKeyHex,
      )

    // Get used payment key hashes
    const response = await fetch(
      `${backendZeroUrl}/wallets/${backendWalletId}/paymentkeyhashes?used=true`,
      {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      },
    )

    if (!response.ok) {
      // ⚠️ FALLBACK: Backend-zero failed, use legacy API
      return legacyFallback.filterUsedAddressesLegacy(addresses, baseApiUrl)
    }

    const usedHashes = (await response.json()) as string[]
    const usedHashSet = new Set(usedHashes)

    // Map payment key hashes back to addresses
    const {getSpendingKey} = await import('../addressInfo/addressInfo')
    const copy = [...addresses]
    return copy.filter((addr) => {
      const keyHash = getSpendingKey(addr)
      return keyHash && usedHashSet.has(keyHash)
    })
  }

  // ⚠️ FALLBACK: No wallet context, use legacy API
  return legacyFallback.filterUsedAddressesLegacy(addresses, baseApiUrl)
}

/**
 * ✅ MIGRATED TO BACKEND-ZERO: POST /tx
 *
 * Uses backend-zero endpoint. Sends transaction CBOR hex as JSON string body.
 * Backend-zero returns transaction hash (discarded to match legacy interface).
 * No fallback to legacy API - backend-zero is the only source.
 */
export const submitTransaction = async (
  signedTx: string,
  baseApiUrl: string,
): Promise<void> => {
  try {
    const backendZeroUrl = getBackendZeroUrl(baseApiUrl)
    // Backend-zero expects JSON string (CBOR hex) as body
    const response = await fetch(`${backendZeroUrl}/tx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signedTx),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Transaction submission failed: ${errorText}`)
    }

    // Backend-zero returns hash, but we discard it to match legacy interface
    await response.text()
  } catch (e) {
    throw e instanceof Error ? handleError(e) : e
  }
}

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /wallets/{id}/rewards
 *
 * Uses backend-zero when wallet context is provided.
 * ⚠️ FALLBACK: Falls back to legacy API (POST /account/state) if:
 *   - Wallet context not provided
 *   - Backend-zero request fails
 *
 * See legacy-api/fallback.ts for fallback implementation.
 */
export const getAccountState = async (
  request: AccountStateRequest,
  baseApiUrl: string,
  walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  },
): Promise<AccountStateResponse> => {
  // If wallet context provided, use backend-zero
  if (walletContext) {
    const backendZeroUrl = getBackendZeroUrl(baseApiUrl)

    // Ensure wallet is registered
    const {
      registerWallet,
      getWalletRegistrationDataFromContext,
      convertWalletIdToEd25519KeyHash,
    } = await import('./wallet-registration')
    const registrationData = getWalletRegistrationDataFromContext({
      walletId: walletContext.walletId,
      publicKeyHex: walletContext.publicKeyHex,
      accountPubKeyHex: walletContext.accountPubKeyHex,
      paymentKeyHashes: walletContext.paymentKeyHashes,
      rewardAddresses: walletContext.rewardAddresses,
    })

    if (registrationData) {
      await registerWallet(registrationData, backendZeroUrl)
    }

    // Always use converted wallet ID (Ed25519KeyHash format) for API calls
    const backendWalletId =
      registrationData?.id ||
      convertWalletIdToEd25519KeyHash(
        walletContext.walletId,
        walletContext.accountPubKeyHex,
      )

    // Get rewards from wallet endpoint
    const rewardsResponse = await fetch(
      `${backendZeroUrl}/wallets/${backendWalletId}/rewards`,
      {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      },
    )

    if (!rewardsResponse.ok) {
      // ⚠️ FALLBACK: Backend-zero failed, use legacy API
      return legacyFallback.getAccountStateLegacy(request, baseApiUrl)
    }

    const rewardsData = (await rewardsResponse.json()) as Array<{
      spendable: string
      nonSpendable: string
      withdrawals: string
      address: string
    }>

    // Map rewards to AccountStateResponse format
    const result: AccountStateResponse = {}
    for (const reward of rewardsData) {
      const totalRewards = (
        BigInt(reward.spendable) + BigInt(reward.nonSpendable)
      ).toString()
      result[reward.address] = {
        remainingAmount: reward.spendable,
        rewards: totalRewards,
        withdrawals: reward.withdrawals,
      }
    }

    // Fill in null for addresses not in rewards (if any)
    for (const address of request.addresses) {
      if (!(address in result)) {
        result[address] = null
      }
    }

    return result
  }

  // ⚠️ FALLBACK: No wallet context, use legacy API
  return legacyFallback.getAccountStateLegacy(request, baseApiUrl)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
  baseApiUrl: string,
  walletContext?: {
    walletId: string
    publicKeyHex?: string
    accountPubKeyHex?: string
    paymentKeyHashes: string[]
    rewardAddresses: string[]
  },
): Promise<AccountStateResponse> => {
  // If wallet context provided, use backend-zero (handles all addresses at once)
  if (walletContext) {
    return getAccountState({addresses}, baseApiUrl, walletContext)
  }

  // Fall back to legacy API with chunking
  const chunks = _.chunk(addresses, limitApiRecords)
  const responses = await Promise.all(
    chunks.map((addrs) => getAccountState({addresses: addrs}, baseApiUrl)),
  )
  return Object.assign({}, ...responses)
}

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /cexplorer-pool-list
 *
 * Uses backend-zero cexplorer proxy for pool info queries.
 * Note: History is not available from cexplorer, returns empty history.
 * No fallback to legacy API - backend-zero is the only source.
 */
export const getPoolInfo = async (
  request: StakePoolInfoRequest,
  baseApiUrl: string,
): Promise<StakePoolInfosAndHistories> => {
  const backendZeroUrl = getBackendZeroUrl(baseApiUrl)
  const result: StakePoolInfosAndHistories = {}

  // Query each pool individually using cexplorer proxy
  for (const poolId of request.poolIds) {
    try {
      // Use cexplorer proxy to get pool info
      const params = new URLSearchParams({
        limit: '1',
        order: 'ranking',
        poolId: poolId,
      })
      const url = `${backendZeroUrl}/cexplorer-pool-list?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })

      if (!response.ok) {
        result[poolId] = null
        continue
      }

      const data = (await response.json()) as {
        data?: {
          data?: Array<{
            pool_id: string
            pool_id_hash_raw: string
            pool_name: {
              ticker: string
              name: string
            }
            pool_update: {
              active: {
                fixed_cost: number
                margin: number
              }
            }
            stats: {
              lifetime: {
                roa: number
              }
            }
            live_stake: number
            roa: string
            saturation: number
          }>
        }
      }

      const pool = data.data?.data?.[0]
      if (!pool) {
        result[poolId] = null
        continue
      }

      // Map to StakePoolInfoAndHistory format
      result[poolId] = {
        info: {
          name: pool.pool_name.name || undefined,
          ticker: pool.pool_name.ticker || undefined,
          // Cexplorer doesn't provide description or homepage
          description: undefined,
          homepage: undefined,
        },
        history: [], // History not available from cexplorer proxy
      }
    } catch (e) {
      // On error, return null for this pool
      result[poolId] = null
    }
  }

  return result
}

/**
 * ❌ LEGACY ONLY: Re-export from legacy-api
 * See legacy-api/index.ts for details
 */
export const getFundInfo = legacyOnly.getFundInfo

/**
 * ✅ MIGRATED TO BACKEND-ZERO: GET /transactions/{hash}
 *
 * Uses backend-zero endpoint. Infers transaction status from transaction query:
 * - If transaction exists with block hash → SUCCESS (confirmed)
 * - If 404 → WAITING (pending or not found)
 * - Other errors → FAILED
 *
 * Note: Depth calculation requires additional block query (not implemented yet).
 * No fallback to legacy API - backend-zero is the only source.
 */
export const fetchTxStatus = async (
  request: TxStatusRequest,
  baseApiUrl: string,
): Promise<TxStatusResponse> => {
  const backendZeroUrl = getBackendZeroUrl(baseApiUrl)
  const submissionStatus: Record<string, TxSubmissionStatus> = {}

  // Query each transaction individually
  for (const txHash of request.txHashes) {
    try {
      const tx = await fetchDefault<{
        hash: string
        block: string
        height?: number
        inputs: unknown[]
        outputs: unknown[]
        fee: unknown
        certificates: unknown[]
        withdrawals: unknown[]
        when: string
      }>(`transactions/${txHash}`, null, backendZeroUrl, 'GET')

      // Transaction exists with block hash = confirmed
      if (tx.block) {
        submissionStatus[txHash] = {
          status: 'SUCCESS',
        }
      } else {
        // Transaction exists but no block = in mempool
        submissionStatus[txHash] = {
          status: 'WAITING',
        }
      }
    } catch (e) {
      // 404 = transaction not found (pending or failed)
      if (
        e instanceof Error &&
        'status' in e &&
        (e as {status: number}).status === 404
      ) {
        submissionStatus[txHash] = {
          status: 'WAITING',
        }
      } else {
        // Other error = failed
        submissionStatus[txHash] = {
          status: 'FAILED',
          reason: e instanceof Error ? e.message : String(e),
        }
      }
    }
  }

  return {
    submissionStatus,
    // Depth calculation would require querying blocks - not implemented yet
    // depth: {}
  }
}
