import {getLogger} from '@yoroi/logger'
import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'
import {
  Address,
  Amount,
  AssetName,
  BalanceQuantity,
  BlockHash,
  Branded,
  EpochNumber,
  PolicyId,
  Portfolio,
  RemoteCertificateMeta,
  SlotNumber,
  TransactionCborBase64,
  TransactionHash,
  TransactionStatus,
  UtxoId,
  WalletTransaction,
} from '@yoroi/types'

import {freeze} from 'immer'

import {
  AccountStateRequest,
  AccountStateResponse,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
  TxSubmissionStatus,
} from '../../api-types'
import {Addresses, CardanoApiAdapter, WalletContext} from '../../types'
import {fetchDefault} from '../../utils/fetch'
import {
  convertWalletIdToEd25519KeyHash,
  getWalletRegistrationDataFromContext,
  registerWallet,
} from '../../utils/wallet-registration'

const logger = getLogger()

/**
 * Internal RawTransaction type - only used within API adapters
 * This is the format returned by backend APIs before transformation
 */
type InternalRawTransaction = {
  readonly type: 'byron' | 'shelley'
  readonly fee?: Amount
  readonly hash: TransactionHash
  readonly last_update: string
  readonly tx_state: string
  readonly inputs: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
    readonly id?: UtxoId
    readonly index?: number
    readonly txHash?: TransactionHash
  }>
  readonly outputs: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
  }>
  readonly withdrawals: Array<{
    readonly address: Address
    readonly amount: Amount
  }>
  readonly certificates: Array<RemoteCertificateMeta>
  readonly valid_contract?: boolean
  readonly script_size?: number
  readonly collateral_inputs?: Array<{
    readonly address: Address
    readonly amount: BalanceQuantity
    readonly assets: Array<{
      readonly tokenId: Portfolio.Token.Id
      readonly policyId: PolicyId
      readonly name: string
      readonly amount: BalanceQuantity
    }>
  }>
  readonly metadata?: Array<{
    label: string
    map_json?: Record<string, unknown> | Array<unknown>
    text_scalar?: string | null
  }>
  readonly block_num?: number
  readonly block_hash?: BlockHash
  readonly tx_ordinal?: number
  readonly time?: string
  readonly epoch?: EpochNumber
  readonly slot?: SlotNumber
}

/**
 * Transform internal RawTransaction to WalletTransaction
 */
function transformToWalletTransaction(
  tx: InternalRawTransaction,
): WalletTransaction {
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: tx.tx_state as TransactionStatus,
    inputs: tx.inputs.map((input) => ({
      id: input.id ? (input.id as unknown as TransactionHash) : undefined,
      address: input.address,
      amount: input.amount as BalanceQuantity,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    outputs: tx.outputs.map((output) => ({
      address: output.address,
      amount: output.amount as BalanceQuantity,
      assets: (output.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    lastUpdatedAt: tx.last_update,
    submittedAt: tx.time ?? null,
    blockNum: tx.block_num ?? null,
    blockHash: tx.block_hash ?? null,
    txOrdinal: tx.tx_ordinal ?? null,
    epoch: tx.epoch ?? null,
    slot: tx.slot ?? null,
    withdrawals: tx.withdrawals,
    certificates: tx.certificates,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((input) => ({
      address: input.address,
      amount: input.amount as BalanceQuantity,
      assets: (input.assets ?? []).map((asset) => ({
        amount: asset.amount as BalanceQuantity,
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name as unknown as AssetName,
      })),
    })),
    memo: null,
    metadata: tx.metadata as WalletTransaction['metadata'],
  }
}

const limitApiRecords = 50

export const backendZeroApiMaker = ({
  backendZeroUrl,
  getSpendingKey,
}: {
  baseApiUrl: string
  backendZeroUrl: string
  getSpendingKey: (address: string) => string | null
}): CardanoApiAdapter => {
  return freeze({
    async getTipStatus(): Promise<TipStatusResponse> {
      const bestBlock = await fetchDefault<{
        hash: string
        height: number
        epoch: number
        slot: number
        globalSlot: number
      }>('bestblock', null, backendZeroUrl, 'GET')

      const blockResponse = {
        height: bestBlock.height,
        epoch: Branded.asEpochNumber(bestBlock.epoch),
        slot: Branded.asSlotNumber(bestBlock.slot),
        hash: Branded.asBlockHash(bestBlock.hash),
        globalSlot: Branded.asSlotNumber(bestBlock.globalSlot),
      }

      return {
        safeBlock: blockResponse,
        bestBlock: blockResponse,
      }
    },

    async fetchNewTxHistory(
      request: TxHistoryRequest,
      walletContext?: WalletContext,
    ): Promise<{isLast: boolean; transactions: Array<WalletTransaction>}> {
      if (!walletContext) {
        throw new Error(
          'Backend-zero fetchNewTxHistory requires wallet context',
        )
      }

      // Ensure wallet is registered
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
        throw new Error(
          `Backend-zero fetchNewTxHistory failed: ${response.statusText}`,
        )
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

      // Map backend-zero Tx format to internal format, then transform to WalletTransaction
      const transactions: WalletTransaction[] = backendTxs.map((tx) => {
        const internalTx: InternalRawTransaction = {
          type: 'shelley' as const,
          hash: Branded.asTransactionHash(tx.hash || ''),
          block_hash:
            tx.block && tx.block.trim()
              ? Branded.asBlockHash(tx.block)
              : undefined,
          block_num: undefined,
          time: new Date(tx.when).toISOString(),
          tx_state: tx.block ? 'Successful' : 'Pending',
          last_update: new Date(tx.when).toISOString(),
          tx_ordinal: undefined,
          inputs: tx.inputs.map((input) => ({
            address: Branded.asAddress(input.source.address),
            amount: Branded.asBalanceQuantity(
              String(input.source.amount.$lovelaces || '0'),
            ),
            assets: Object.entries(input.source.amount)
              .filter(([key]) => key !== '$lovelaces')
              .map(([assetId, amount]) => {
                const [policyId = '', nameHex = ''] = assetId.split('.')
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
                  policyId: Branded.asPolicyId(policyId),
                  name: nameHex,
                  amount: Branded.asBalanceQuantity(amountStr),
                }
              }),
            id: Branded.asUtxoIdFromParts(
              Branded.asTransactionHash(input.txHash),
              input.index,
            ),
            index: input.index,
            txHash: Branded.asTransactionHash(input.txHash),
          })),
          outputs: tx.outputs.map((output) => ({
            address: Branded.asAddress(output.address),
            amount: Branded.asBalanceQuantity(
              String(output.amount.$lovelaces || '0'),
            ),
            assets: Object.entries(output.amount)
              .filter(([key]) => key !== '$lovelaces')
              .map(([assetId, amount]) => {
                const [policyId = '', nameHex = ''] = assetId.split('.')
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
                  policyId: Branded.asPolicyId(policyId),
                  name: nameHex,
                  amount: Branded.asBalanceQuantity(amountStr),
                }
              }),
          })),
          fee: Branded.asBalanceQuantity(String(tx.fee.$lovelaces || '0')),
          certificates: tx.certificates as Array<RemoteCertificateMeta>,
          withdrawals: (tx.withdrawals || []).map((w: unknown) => {
            const withdrawal = w as {
              address?: string
              amount?:
                | string
                | number
                | bigint
                | {readonly $lovelaces?: string | number | bigint}
            }
            return {
              address: Branded.asAddress(withdrawal.address || ''),
              amount: Branded.asBalanceQuantity(
                typeof withdrawal.amount === 'object' &&
                  withdrawal.amount?.$lovelaces != null
                  ? String(withdrawal.amount.$lovelaces)
                  : typeof withdrawal.amount === 'string'
                    ? withdrawal.amount
                    : typeof withdrawal.amount === 'number' ||
                        typeof withdrawal.amount === 'bigint'
                      ? String(withdrawal.amount)
                      : '0',
              ),
            }
          }),
          // ⚠️ METADATA MISSING: Backend-zero API doesn't return transaction metadata
          metadata: undefined,
        }
        return transformToWalletTransaction(internalTx)
      })

      return {
        transactions,
        isLast: transactions.length < limitApiRecords,
      }
    },

    async filterUsedAddresses(
      addresses: Addresses,
      walletContext?: WalletContext,
    ): Promise<Addresses> {
      if (!walletContext) {
        throw new Error(
          'Backend-zero filterUsedAddresses requires wallet context',
        )
      }

      // Ensure wallet is registered
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

      const backendWalletId =
        registrationData?.id ||
        convertWalletIdToEd25519KeyHash(
          walletContext.walletId,
          walletContext.accountPubKeyHex,
        )

      const response = await fetch(
        `${backendZeroUrl}/wallets/${backendWalletId}/paymentkeyhashes?used=true`,
        {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        },
      )

      if (!response.ok) {
        throw new Error(
          `Backend-zero filterUsedAddresses failed: ${response.statusText}`,
        )
      }

      const usedHashes = (await response.json()) as string[]
      const usedHashSet = new Set(usedHashes)

      const copy = [...addresses]
      return copy.filter((addr) => {
        const keyHash = getSpendingKey(addr)
        return keyHash && usedHashSet.has(keyHash)
      })
    },

    async submitTransaction(signedTx: TransactionCborBase64): Promise<void> {
      const txStr = typeof signedTx === 'string' ? signedTx : signedTx
      const response = await fetch(`${backendZeroUrl}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(txStr),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error('backendZeroApi.submitTransaction: HTTP request failed', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        })
        throw new Error(`Transaction submission failed: ${errorText}`)
      }

      await response.text()
    },

    async getAccountState(
      request: AccountStateRequest,
      walletContext?: WalletContext,
    ): Promise<AccountStateResponse> {
      if (!walletContext) {
        throw new Error('Backend-zero getAccountState requires wallet context')
      }

      // Ensure wallet is registered
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

      const backendWalletId =
        registrationData?.id ||
        convertWalletIdToEd25519KeyHash(
          walletContext.walletId,
          walletContext.accountPubKeyHex,
        )

      const rewardsResponse = await fetch(
        `${backendZeroUrl}/wallets/${backendWalletId}/rewards`,
        {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        },
      )

      if (!rewardsResponse.ok) {
        throw new Error(
          `Backend-zero getAccountState failed: ${rewardsResponse.statusText}`,
        )
      }

      const rewardsData = (await rewardsResponse.json()) as Array<{
        spendable: string
        nonSpendable: string
        withdrawals: string
        address: string
      }>

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

      for (const address of request.addresses) {
        if (!(address in result)) {
          result[address] = null
        }
      }

      return result
    },

    async bulkGetAccountState(
      addresses: Addresses,
      walletContext?: WalletContext,
    ): Promise<AccountStateResponse> {
      return this.getAccountState({addresses}, walletContext)
    },

    async getPoolInfo(
      request: StakePoolInfoRequest,
    ): Promise<StakePoolInfosAndHistories> {
      const result: StakePoolInfosAndHistories = {}

      for (const poolId of request.poolIds) {
        try {
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

          result[poolId] = {
            info: {
              name: pool.pool_name.name || undefined,
              ticker: pool.pool_name.ticker || undefined,
              description: undefined,
              homepage: undefined,
            },
            history: [],
          }
        } catch (e) {
          result[poolId] = null
        }
      }

      return result
    },

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      const submissionStatus: Record<string, TxSubmissionStatus> = {}

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

          if (tx.block) {
            submissionStatus[txHash] = {
              status: 'SUCCESS',
            }
          } else {
            submissionStatus[txHash] = {
              status: 'WAITING',
            }
          }
        } catch (e) {
          if (
            e instanceof Error &&
            'status' in e &&
            (e as {status: number}).status === 404
          ) {
            submissionStatus[txHash] = {
              status: 'WAITING',
            }
          } else {
            submissionStatus[txHash] = {
              status: 'FAILED',
              reason: e instanceof Error ? e.message : String(e),
            }
          }
        }
      }

      return {
        submissionStatus,
      }
    },
  } as CardanoApiAdapter)
}
