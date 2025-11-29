import type {AccountStateResponse} from '@yoroi/api'
import {getLogger, isHex} from '@yoroi/common'
import {
  CertificateKind,
  DRepValue,
  ModernUtxo,
  addCertificate,
  addInputs,
  addWithdrawal,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  filterPureAdaUtxos,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Address, Amount, Branded, Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export type CreateWithdrawalWithGovernanceTxParams = {
  utxos: ModernUtxo[]
  rewardAddressHex: Address | string
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => Address | string
  getStakingKey: () => PublicKey
  getAccountState: (addresses: Address[]) => Promise<AccountStateResponse>
  getDelegationStatus: () => {isRegistered: boolean}
  shouldDeregister: boolean
  addressMode: Wallet.AddressMode
  drepValue: DRepValue
}

/**
 * Creates a transaction that combines:
 * 1. Stake rewards withdrawal
 * 2. DRep vote delegation (governance)
 *
 * This allows users to withdraw their staking rewards and delegate voting power
 * to a DRep (like Yoroi) in a single transaction.
 */
export async function createWithdrawalWithGovernanceTx({
  utxos,
  rewardAddressHex,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getAccountState,
  getDelegationStatus,
  shouldDeregister,
  addressMode,
  drepValue,
}: CreateWithdrawalWithGovernanceTxParams): Promise<{cbor: string}> {
  const logger = getLogger()

  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddressRaw = getChangeAddress(addressMode)
  const changeAddress =
    typeof changeAddressRaw === 'string'
      ? (changeAddressRaw as Address)
      : changeAddressRaw
  const rewardAddressBranded =
    typeof rewardAddressHex === 'string'
      ? Branded.asAddress(rewardAddressHex)
      : rewardAddressHex
  const accountState = await getAccountState([rewardAddressBranded])
  const isRegistered = getDelegationStatus().isRegistered

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Get withdrawal amount from account state
  let rewards = '0'
  for (const address in accountState) {
    const state = accountState[address]
    if (state) {
      rewards = state.remainingAmount ?? Branded.ZERO_QUANTITY
      break
    }
  }

  // Extract stake credential key hash from staking key
  const stakeKeyHashHex = CardanoMobileWrapped.cslScope(() => {
    const keyHash = getStakingKey().hash()
    return keyHash.toHex()
  })

  // Extract reward address bech32 if we have rewards
  let rewardAddressBech32: string | undefined

  if (BigInt(rewards) > 0n) {
    rewardAddressBech32 = CardanoMobileWrapped.cslScope((csl) => {
      let address
      if (csl.ByronAddress.isValid(rewardAddressHex)) {
        const byronAddr = csl.ByronAddress.fromBase58(rewardAddressHex)
        address = byronAddr.toAddress()
      } else {
        const isHexAddr = isHex(rewardAddressHex)
        address = isHexAddr
          ? csl.Address.fromHex(rewardAddressHex)
          : csl.Address.fromBech32(rewardAddressHex)
      }
      if (!address || address.isMalformed()) {
        throw new Error(`Invalid reward address: ${rewardAddressHex}`)
      }
      return address.toBech32(undefined) as Address
    })
  }

  // Helper function to calculate required ADA based on fee estimate
  // Must account for: fee (and deposit if registering) + minimum UTXO for change output
  // Note: Deregistration refund is returned in outputs, not subtracted from inputs
  const calculateRequiredAda = (feeEstimate: bigint): string => {
    const minUtxoValue = BigInt(
      protocolParamsConfig.minimumUtxoVal || '1000000',
    )
    const feeBuffer = BigInt('100000')
    // Account for deposit if registering stake key
    const depositIfNeeded = !isRegistered
      ? BigInt(protocolParams.keyDeposit)
      : 0n
    const baseRequired = feeEstimate + depositIfNeeded + minUtxoValue
    return (baseRequired + feeBuffer).toString()
  }

  // Helper function to select UTXOs preferring pure ADA, smallest first
  const selectUtxosWithStrategy = (requiredAdaAmount: string): ModernUtxo[] => {
    const pureAdaUtxos = filterPureAdaUtxos(utxos, primaryTokenId)
    const utxosWithTokens = utxos.filter((utxo) => !pureAdaUtxos.includes(utxo))

    const sortedPureAda = [...pureAdaUtxos].sort((a, b) => {
      const aAda = BigInt(a.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY)
      const bAda = BigInt(b.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY)
      if (aAda < bAda) return -1
      if (aAda > bAda) return 1
      return 0
    })

    const requiredAdaBigInt = BigInt(requiredAdaAmount)
    const selected: ModernUtxo[] = []
    let selectedAda = BigInt(0)

    for (const utxo of sortedPureAda) {
      if (selectedAda >= requiredAdaBigInt) break
      selected.push(utxo)
      selectedAda += BigInt(
        utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY,
      )
    }

    if (selectedAda < requiredAdaBigInt) {
      const minUtxoValueForTokens = BigInt('1000000')
      const feeBuffer = BigInt('100000')
      const requiredWithBuffer =
        requiredAdaBigInt + minUtxoValueForTokens + feeBuffer

      const additionalUtxos = selectUtxosForAmount(
        utxosWithTokens,
        requiredWithBuffer.toString(),
        primaryTokenId,
      )

      selected.push(...additionalUtxos)
    }

    return selected
  }

  const maxRetries = 3
  const feeMultipliers: number[] = [1.0, 1.5, 2.0]
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Estimate fee - combined transactions are larger (~600-800 bytes)
      const baseTxSize = 700
      const txSizeMultiplier = feeMultipliers[attempt] ?? 2.0
      const estimatedTxSize = Math.floor(baseTxSize * txSizeMultiplier)
      const estimatedFee =
        BigInt(protocolParams.linearFee.constant) +
        BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

      const requiredAda = calculateRequiredAda(estimatedFee)
      const selectedUtxos = selectUtxosWithStrategy(requiredAda)

      // Build transaction
      let builderState = createTransactionBuilder()

      // Add inputs
      builderState = addInputs(builderState, selectedUtxos)

      // Add withdrawal if we have rewards
      if (rewardAddressBech32 && BigInt(rewards) > 0n) {
        const rewardAddr =
          typeof rewardAddressBech32 === 'string'
            ? (rewardAddressBech32 as Address)
            : rewardAddressBech32
        const rewardsAmount =
          typeof rewards === 'string' ? (rewards as Amount) : rewards
        builderState = addWithdrawal(builderState, rewardAddr, rewardsAmount)
      }

      // Add stake registration certificate if not registered
      if (!isRegistered) {
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeRegistration,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
        })
      }

      // Add vote delegation certificate for DRep only if not deregistering
      // Deregistering removes the stake key, making vote delegation meaningless
      if (!shouldDeregister) {
        builderState = addCertificate(builderState, {
          kind: CertificateKind.VoteDelegation,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
          drep: drepValue,
        })
      }

      // Add deregistration certificate if requested
      if (shouldDeregister) {
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeDeregistration,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
        })
      }

      // Set change address and TTL
      builderState = setChangeAddress(builderState, changeAddress)
      builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

      logger.info('createWithdrawalWithGovernanceTx: Building combined tx', {
        hasRewards: BigInt(rewards) > 0n,
        rewards,
        isRegistered,
        shouldDeregister,
        drepValue,
      })

      const result = await buildRecipeTransaction(
        builderState,
        protocolParamsConfig,
        primaryTokenId,
      )
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errorMessage = lastError.message

      const isRetryableError =
        errorMessage.includes('Not enough ADA leftover') ||
        errorMessage.includes('add_change_if_needed')

      if (isRetryableError && attempt < maxRetries - 1) {
        logger.warn(
          'createWithdrawalWithGovernanceTx: Retryable error, will retry',
          {
            attempt: attempt + 1,
            maxRetries,
            error: errorMessage,
          },
        )
        continue
      } else {
        logger.error(
          'createWithdrawalWithGovernanceTx: Failed to build transaction',
          {
            attempt: attempt + 1,
            maxRetries,
            error: errorMessage,
            errorStack: lastError.stack,
          },
        )
        throw lastError
      }
    }
  }

  throw (
    lastError ||
    new Error(
      'Failed to build withdrawal with governance transaction after all retries',
    )
  )
}
