import {RemoteCertificateMeta} from '@yoroi/staking'
import {
  Address,
  AssetName,
  BalanceQuantity,
  Branded,
  PolicyId,
  TransactionHash,
  TransactionStatus,
} from '@yoroi/types'
import {WalletTransaction} from '@yoroi/types'

import {FormattedTx} from '~/features/ReviewTx/common/types'

/**
 * Convert FormattedTx to WalletTransaction format for optimistic updates
 * Uses already-extracted transaction data from review screen
 */
export function createOptimisticTransactionFromFormattedTx(
  formattedTx: FormattedTx,
  txId: string,
  memo: string | null = null,
): WalletTransaction {
  const now = new Date().toISOString()

  // Helper to extract policyId and name from tokenId
  const getTokenParts = (tokenId: string) => {
    const [policyId, assetNameHex = ''] = tokenId.split('.')
    const name = Buffer.from(assetNameHex, 'hex').toString('utf8')
    return {
      policyId: policyId as PolicyId,
      name: (name || assetNameHex) as AssetName,
    }
  }

  // Convert inputs
  const inputs = formattedTx.inputs.map((input) => {
    const primaryAsset = input.assets.find(
      (asset) => asset.tokenInfo.id === formattedTx.fee.tokenInfo.id,
    )
    const otherAssets = input.assets.filter(
      (asset) => asset.tokenInfo.id !== formattedTx.fee.tokenInfo.id,
    )

    return {
      address: (input.address ?? '') as Address,
      amount: (primaryAsset?.quantity ?? '0') as BalanceQuantity,
      assets: otherAssets.map((asset) => {
        const {policyId, name} = getTokenParts(asset.tokenInfo.id)
        return {
          amount: asset.quantity as BalanceQuantity,
          tokenId: asset.tokenInfo.id,
          policyId,
          name,
        }
      }),
      id: input.txHash
        ? (Branded.asTransactionHash(input.txHash) as TransactionHash)
        : undefined,
    }
  })

  // Convert outputs
  const outputs = formattedTx.outputs.map((output) => {
    const primaryAsset = output.assets.find(
      (asset) => asset.tokenInfo.id === formattedTx.fee.tokenInfo.id,
    )
    const otherAssets = output.assets.filter(
      (asset) => asset.tokenInfo.id !== formattedTx.fee.tokenInfo.id,
    )

    return {
      address: output.address as Address,
      amount: (primaryAsset?.quantity ?? '0') as BalanceQuantity,
      assets: otherAssets.map((asset) => {
        const {policyId, name} = getTokenParts(asset.tokenInfo.id)
        return {
          amount: asset.quantity as BalanceQuantity,
          tokenId: asset.tokenInfo.id,
          policyId,
          name,
        }
      }),
    }
  })

  // Convert fee
  const fee = formattedTx.fee.quantity as BalanceQuantity

  // Convert certificates
  const certificates: Array<RemoteCertificateMeta> =
    formattedTx.certificates?.map((cert) => {
      // FormattedCertificate can be either Transformed<CertificateJSON> or MinimalCertificate
      // Transformed format: {type: CertificateKind, value: CertificateJSON[CertificateKind]}
      // Minimal format: {type: CertificateType, value: Partial<Record<string, unknown>>}
      const certType = 'type' in cert ? cert.type : undefined
      const certValue = 'value' in cert ? cert.value : cert

      // If certType is not available, try to infer from cert structure
      let kind: RemoteCertificateMeta['kind'] = 'StakeRegistration'
      if (certType) {
        kind = certType as RemoteCertificateMeta['kind']
      } else if (typeof certValue === 'object' && certValue !== null) {
        // Try to infer from value structure
        if ('poolKeyHash' in certValue) {
          kind = 'StakeDelegation'
        } else if ('poolParams' in certValue) {
          kind = 'PoolRegistration'
        } else if ('drep' in certValue) {
          kind = 'VoteDelegation'
        }
      }

      // Build certificate based on kind
      if (typeof certValue === 'object' && certValue !== null) {
        switch (kind) {
          case 'StakeRegistration':
          case 'StakeDeregistration':
          case 'DRepDeregistration':
          case 'DRepRegistration':
          case 'DRepUpdate':
          case 'GenesisKeyDelegation':
          case 'CommitteeHotAuth':
          case 'CommitteeColdResign': {
            const rewardAddress = (
              'rewardAddress' in certValue && certValue.rewardAddress
                ? certValue.rewardAddress
                : ''
            ) as string
            return {kind, rewardAddress} as RemoteCertificateMeta
          }
          case 'StakeDelegation': {
            const rewardAddress = (
              'rewardAddress' in certValue && certValue.rewardAddress
                ? certValue.rewardAddress
                : ''
            ) as string
            const poolKeyHash = (
              'poolKeyHash' in certValue && certValue.poolKeyHash
                ? certValue.poolKeyHash
                : ''
            ) as string
            return {kind, rewardAddress, poolKeyHash} as RemoteCertificateMeta
          }
          case 'PoolRegistration': {
            const poolParams = (
              'poolParams' in certValue && certValue.poolParams
                ? certValue.poolParams
                : {}
            ) as Record<string, unknown>
            return {kind, poolParams} as RemoteCertificateMeta
          }
          case 'PoolRetirement': {
            const poolKeyHash = (
              'poolKeyHash' in certValue && certValue.poolKeyHash
                ? certValue.poolKeyHash
                : ''
            ) as string
            return {kind, poolKeyHash} as RemoteCertificateMeta
          }
          case 'VoteDelegation':
          case 'VoteRegistrationAndDelegation': {
            const rewardAddress = (
              'rewardAddress' in certValue && certValue.rewardAddress
                ? certValue.rewardAddress
                : ''
            ) as string
            const drep = (
              'drep' in certValue ? certValue.drep : null
            ) as unknown
            return {
              kind,
              rewardAddress,
              drep: drep ?? null,
            } as RemoteCertificateMeta
          }
          case 'StakeAndVoteDelegation':
          case 'StakeVoteRegistrationAndDelegation':
          case 'StakeRegistrationAndDelegation': {
            const rewardAddress = (
              'rewardAddress' in certValue && certValue.rewardAddress
                ? certValue.rewardAddress
                : ''
            ) as string
            const poolKeyHash = (
              'poolKeyHash' in certValue && certValue.poolKeyHash
                ? certValue.poolKeyHash
                : undefined
            ) as string | undefined
            const drep = (
              'drep' in certValue ? certValue.drep : null
            ) as unknown
            return {
              kind,
              rewardAddress,
              ...(poolKeyHash && {poolKeyHash}),
              drep: drep ?? null,
            } as RemoteCertificateMeta
          }
          case 'MoveInstantaneousRewardsCert': {
            const rewards = (
              'rewards' in certValue && certValue.rewards
                ? certValue.rewards
                : {}
            ) as Record<string, string>
            const pot = (
              'pot' in certValue && typeof certValue.pot === 'number'
                ? certValue.pot
                : 0
            ) as 0 | 1
            return {kind, rewards, pot} as RemoteCertificateMeta
          }
          default:
            return {kind, rewardAddress: ''} as RemoteCertificateMeta
        }
      }

      return {kind, rewardAddress: ''} as RemoteCertificateMeta
    }) ?? []

  // Convert withdrawals
  const withdrawals =
    formattedTx.withdrawals?.map((withdrawal) => ({
      address: withdrawal.address as Address,
      amount: withdrawal.amount as BalanceQuantity,
    })) ?? []

  // Convert collateral inputs
  const collateralInputs = formattedTx.collateral?.map((input) => {
    const primaryAsset = input.assets.find(
      (asset) => asset.tokenInfo.id === formattedTx.fee.tokenInfo.id,
    )
    const otherAssets = input.assets.filter(
      (asset) => asset.tokenInfo.id !== formattedTx.fee.tokenInfo.id,
    )

    return {
      address: (input.address ?? '') as Address,
      amount: (primaryAsset?.quantity ?? '0') as BalanceQuantity,
      assets: otherAssets.map((asset) => {
        const {policyId, name} = getTokenParts(asset.tokenInfo.id)
        return {
          amount: asset.quantity as BalanceQuantity,
          tokenId: asset.tokenInfo.id,
          policyId,
          name,
        }
      }),
    }
  })

  return {
    id: Branded.asTransactionHash(txId),
    status: 'SUBMITTED' as TransactionStatus,
    fee,
    inputs,
    outputs,
    certificates,
    withdrawals,
    submittedAt: now,
    lastUpdatedAt: now,
    blockNum: null,
    blockHash: null,
    txOrdinal: null,
    epoch: null,
    slot: null,
    memo,
    collateralInputs,
  }
}
