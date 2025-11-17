import {cardanoConfig} from '@yoroi/blockchains'
import {Balance, Portfolio, Wallet} from '@yoroi/types'

import {Buffer} from 'buffer'

import type {StakingInfo} from '../../types/staking'
import {Quantities} from '../../utils/utils'
import {CardanoMobile} from '../../wallets'
import {getDelegationStatus} from '../delegationUtils'
import type {CardanoTypes, YoroiWallet} from '../types'

/**
 * Get staking key for a wallet
 */
export const getStakingKey = (
  wallet: {
    publicKeyHex: string
    accountVisual: number
    externalAddresses: string[]
    internalAddresses: string[]
  },
  implementation: Wallet.Implementation,
  _chainId: number,
): CardanoTypes.PublicKey => {
  const implementationConfig =
    cardanoConfig.implementations[
      implementation as keyof typeof cardanoConfig.implementations
    ]

  if (!implementationConfig.features.staking) {
    throw new Error('getStakingKey: staking not supported')
  }

  // For read-only wallets, extract staking key hash from addresses
  // since we don't have publicKeyHex to derive it
  if (!wallet.publicKeyHex || wallet.publicKeyHex === '') {
    // Try to extract staking key hash from one of the wallet's addresses
    const addresses = [...wallet.externalAddresses, ...wallet.internalAddresses]

    for (const address of addresses) {
      try {
        const wasmAddress = CardanoMobile.Address.fromBech32(address)
        const baseAddr = CardanoMobile.BaseAddress.fromAddress(wasmAddress)
        if (baseAddr?.hasValue()) {
          const stakeCred = baseAddr.stakeCred()
          const keyHash = stakeCred.toKeyhash()
          if (keyHash?.hasValue()) {
            // Create a wrapper PublicKey-like object that returns the key hash
            // This allows read-only wallets to work with code that expects getStakingKey().hash()
            return {
              hash: () => keyHash,
            } as CardanoTypes.PublicKey
          }
        }
      } catch {
        // Continue to next address
        continue
      }
    }

    throw new Error(
      'getStakingKey: Could not extract staking key from addresses for read-only wallet',
    )
  }

  // For full wallets, derive from publicKeyHex
  const derivation = implementationConfig.features.staking.derivation

  const accountPubKey = CardanoMobile.Bip32PublicKey.fromBytes(
    new Uint8Array(Buffer.from(wallet.publicKeyHex, 'hex')),
  )
  const stakingKey = accountPubKey
    .derive(derivation.role)
    .derive(derivation.index)
    .toRawKey()

  return stakingKey
}

/**
 * Get delegation status for a wallet
 */
type PerAddressCertificatesDict = Record<
  string,
  Record<
    string,
    import('../transactionManager/transactionManager').TimestampedCertMeta
  >
>

export const getWalletDelegationStatus = (
  rewardAddressHex: string,
  perRewardAddressCertificates: PerAddressCertificatesDict,
): ReturnType<typeof getDelegationStatus> => {
  const certsForKey = perRewardAddressCertificates[rewardAddressHex]
  return getDelegationStatus(rewardAddressHex, certsForKey || {})
}

/**
 * Get staking info for a wallet
 */
export const getWalletStakingInfo = async (wallet: {
  rewardAddressHex: string
  getAllUtxosForKey: () => Array<CardanoTypes.CardanoAddressedUtxo>
  fetchAccountState: () => Promise<
    import('~/wallets/types/other').AccountStateResponse
  >
  balanceManager: YoroiWallet['balanceManager']
  portfolioPrimaryTokenInfo: Portfolio.Token.Info
  getDelegationStatus: () => ReturnType<typeof getDelegationStatus>
}): Promise<StakingInfo> => {
  const stakingStatus = wallet.getDelegationStatus()
  if (!stakingStatus.isRegistered) return {status: 'not-registered'}
  if (!('poolKeyHash' in stakingStatus)) return {status: 'registered'}

  const accountStates = await wallet.fetchAccountState()
  const accountState = accountStates[wallet.rewardAddressHex]
  if (!accountState || accountState === null)
    throw new Error('Account state not found')

  const stakingUtxos = wallet.getAllUtxosForKey()
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  const remainingAmount = accountState.remainingAmount || '0'
  const amount = Quantities.sum([
    ...stakingUtxos.map(
      (utxo) => (utxo.balance[primaryTokenId] || '0') as Balance.Quantity,
    ),
    remainingAmount as Balance.Quantity,
  ])

  wallet.balanceManager.updatePrimaryDerived({
    availableRewards: BigInt(remainingAmount),
  })

  return {
    status: 'staked',
    poolId: stakingStatus.poolKeyHash,
    amount,
    rewards: remainingAmount as Balance.Quantity,
  }
}
