import {isHex} from '@yoroi/common'
import {
  CertificateKind,
  ModernUtxo,
  addCertificate,
  addInputs,
  addWithdrawal,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import type {AccountStateResponse} from '~/wallets/types/other'

export type CreateWithdrawalTxParams = {
  utxos: ModernUtxo[]
  rewardAddressHex: string
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  getStakingKey: () => PublicKey
  getAccountState: (addresses: string[]) => Promise<AccountStateResponse>
  shouldDeregister: boolean
  addressMode: Wallet.AddressMode
}

export async function createWithdrawalTx({
  utxos,
  rewardAddressHex,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getAccountState,
  shouldDeregister,
  addressMode,
}: CreateWithdrawalTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)
  const accountState = await getAccountState([rewardAddressHex])

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Get withdrawal amount from account state
  // The API might return the address in a different format (bech32 vs hex),
  // so we iterate over all keys to find the matching account state
  // Use remainingAmount (available rewards) instead of rewards (total ever earned)
  let rewards = '0'
  for (const address in accountState) {
    const state = accountState[address]
    if (state) {
      rewards = state.remainingAmount || '0'
      break // Use first non-null account state (we only requested one address)
    }
  }

  // Estimate fee for withdrawal transaction
  // Withdrawal transactions are typically small (~300-500 bytes)
  const estimatedTxSize = 500 // bytes - conservative estimate
  const estimatedFee =
    BigInt(protocolParams.linearFee.constant) +
    BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

  // In Conway era, withdrawals require a certificate that affects the rewards account
  // If explicitly deregistering, we need deposit + fee (deposit is returned as change)
  // Otherwise, we just need fee (certificate doesn't require deposit if not deregistering)
  const requiresDeregistration = shouldDeregister
  const requiredAda = requiresDeregistration
    ? (BigInt(protocolParams.keyDeposit) + estimatedFee).toString()
    : estimatedFee.toString()

  // Select only necessary UTXOs to cover fees (and deposit if deregistering)
  const selectedUtxos = selectUtxosForAmount(utxos, requiredAda, primaryTokenId)

  // Build transaction using functional TransactionBuilder
  let builderState = createTransactionBuilder()

  // Add only selected UTXOs as inputs
  builderState = addInputs(builderState, selectedUtxos)

  // Extract stake credential key hash - needed for certificate (Conway requirement)
  // If we have rewards, extract from reward address; if deregistering without rewards, extract from staking key
  let stakeCredentialKeyHashHex: string | undefined
  let rewardAddressBech32: string | undefined

  if (BigInt(rewards) > 0n) {
    // Convert reward address to bech32 and extract stake credential
    const result = CardanoMobileWrapped.cslScope((csl) => {
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

      const rewardAddr = csl.RewardAddress.fromAddress(address)
      if (!rewardAddr) {
        throw new Error(
          `Failed to create RewardAddress from address: ${rewardAddressHex}`,
        )
      }
      const stakeCred = rewardAddr.paymentCred()
      if (!stakeCred) {
        throw new Error(
          `Failed to extract stake credential from reward address: ${rewardAddressHex}`,
        )
      }

      const bech32 = address.toBech32(undefined)
      if (!bech32) {
        throw new Error(
          `Failed to convert reward address to bech32: ${rewardAddressHex}`,
        )
      }

      const keyHash = stakeCred.toKeyhash()
      if (!keyHash) {
        throw new Error(
          `Reward address stake credential is not a key hash: ${rewardAddressHex}`,
        )
      }

      return {
        rewardAddressBech32: bech32,
        stakeCredentialKeyHashHex: keyHash.toHex(),
      }
    })
    rewardAddressBech32 = result.rewardAddressBech32
    stakeCredentialKeyHashHex = result.stakeCredentialKeyHashHex
  } else if (shouldDeregister) {
    // No rewards but deregistering - extract from staking key
    stakeCredentialKeyHashHex = CardanoMobileWrapped.cslScope(() => {
      const keyHash = getStakingKey().hash()
      return keyHash.toHex()
    })
  }

  // Add withdrawal if we have rewards
  if (rewardAddressBech32) {
    builderState = addWithdrawal(builderState, rewardAddressBech32, rewards)

    // Only add certificate when explicitly deregistering (matches yoroi-lib behavior)
    // Normal withdrawals don't require certificates
    if (shouldDeregister) {
      if (!stakeCredentialKeyHashHex) {
        throw new Error(
          'Cannot create withdrawal transaction: failed to extract stake credential from reward address',
        )
      }
      builderState = addCertificate(builderState, {
        kind: CertificateKind.StakeDeregistration,
        stakeCredentialKeyHashHex,
      })
    }
  } else if (shouldDeregister && stakeCredentialKeyHashHex) {
    // No rewards but deregistering - add deregistration certificate
    builderState = addCertificate(builderState, {
      kind: CertificateKind.StakeDeregistration,
      stakeCredentialKeyHashHex,
    })
  }

  // Set change address
  builderState = setChangeAddress(builderState, changeAddress)

  // Set TTL with buffer
  builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

  // Build the transaction
  return await buildRecipeTransaction(
    builderState,
    protocolParamsConfig,
    primaryTokenId,
  )
}
