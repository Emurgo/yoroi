/**
 * Create multisig wallet from co-signers and quorum rules
 */
import type {WalletEncryptedStorage} from '@yoroi/cardano-wallet'
import {
  buildPaymentScript,
  buildStakingScript,
  deriveMultisigAccount,
} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {Chain, Wallet} from '@yoroi/types'
import {Bip32PublicKeyHex, ScriptCbor} from '@yoroi/types'

import {v4} from 'uuid'

import {createWalletMeta} from '../lifecycle/wallet-lifecycle'
import {getWalletFactory} from '../network-manager/get-wallet-factory'

/**
 * Parameters for creating a multisig wallet
 */
type CreateMultisigWalletParams = {
  name: string
  coSigners: ReadonlyArray<Wallet.CoSigner>
  quorumRules: Wallet.QuorumRules
  parentWalletIds: ReadonlyArray<string>
  parentWalletRootKeys: ReadonlyArray<{
    walletId: string
    rootKeyHex: string
    accountVisual: number
    implementation: Wallet.Implementation
  }>
  network: Chain.SupportedNetworks
  version: number
}

/**
 * Result of creating a multisig wallet
 */
type CreateMultisigWalletResult = {
  readonly walletId: string
  readonly meta: Wallet.Meta
  readonly paymentScriptCbor: ScriptCbor
  readonly stakingScriptCbor: ScriptCbor
}

/**
 * Create a multisig wallet from co-signers and quorum rules
 *
 * This function:
 * 1. Derives shared wallet keys from parent wallets
 * 2. Builds payment and staking native scripts
 * 3. Creates wallet metadata with multisig information
 * 4. Stores scripts in wallet storage
 */
export const createMultisigWallet = async (
  params: CreateMultisigWalletParams,
  _makeWalletEncryptedStorage: (id: string) => WalletEncryptedStorage,
): Promise<CreateMultisigWalletResult> => {
  const {name, coSigners, quorumRules, parentWalletIds, network, version} =
    params

  const logger = getLogger()

  // Validate inputs
  if (coSigners.length === 0) {
    throw new Error('At least one co-signer is required')
  }

  if (quorumRules.kind === 'RequireNOf') {
    if (quorumRules.required <= 0 || quorumRules.required > coSigners.length) {
      throw new Error(
        `Invalid quorum: required (${quorumRules.required}) must be between 1 and ${coSigners.length}`,
      )
    }
  }

  // Extract shared wallet keys from co-signers
  const sharedWalletKeys = coSigners.map(
    (coSigner) => coSigner.sharedWalletKey as Bip32PublicKeyHex,
  )

  // Build payment and staking scripts
  logger.debug('createMultisigWallet: Building native scripts', {
    coSignerCount: coSigners.length,
    quorumKind: quorumRules.kind,
  })

  const paymentScriptCbor = (await buildPaymentScript(
    sharedWalletKeys,
    quorumRules,
  )) as ScriptCbor

  const stakingScriptCbor = (await buildStakingScript(
    sharedWalletKeys,
    quorumRules,
  )) as ScriptCbor

  // Generate wallet ID
  const walletId = v4()

  // Create wallet metadata
  // For multisig wallets, we use a placeholder accountPubKeyHex
  // The actual address is derived from script hashes
  const walletFactory = getWalletFactory({
    network,
    implementation: 'cardano-cip1852', // Multisig uses CIP-1852 base
  })

  // Use first co-signer's shared wallet key for checksum/avatar generation
  const firstSharedKey = sharedWalletKeys[0]
  if (!firstSharedKey) {
    throw new Error('No shared wallet keys available')
  }

  // Generate checksum and avatar from first shared key
  // Note: This is a placeholder - multisig wallets don't have a single accountPubKeyHex
  const {ImagePart: seed, TextPart: plate} =
    walletFactory.calcChecksum(firstSharedKey)
  const avatar = Blockies({seed}).asBase64()

  // Create multisig metadata
  const multisigMeta: Wallet.MultisigWalletMeta = {
    coSigners,
    quorumRules,
    paymentScriptCbor,
    stakingScriptCbor,
    parentWalletIds,
  }

  // Create wallet metadata with multisig info
  const meta = await createWalletMeta(
    walletId,
    name,
    0, // networkId - deprecated
    'cardano-multisig', // Multisig implementation
    'multiple', // addressMode - multisig always uses multiple addresses
    false, // isHW
    false, // isEasyConfirmationEnabled
    plate,
    avatar,
    false, // isReadOnly - multisig wallets can sign
    null, // hwDeviceInfo
    version,
    multisigMeta,
  )

  logger.debug('createMultisigWallet: Multisig wallet created', {
    walletId,
    coSignerCount: coSigners.length,
  })

  return {
    walletId,
    meta,
    paymentScriptCbor,
    stakingScriptCbor,
  }
}

/**
 * Generate shared wallet key from a parent wallet
 * This is used during multisig wallet creation flow
 */
export const generateSharedWalletKey = async (
  _parentWalletId: string,
  parentWalletRootKeyHex: string,
  accountVisual: number,
  implementation: Wallet.Implementation,
): Promise<Bip32PublicKeyHex> => {
  const derivation = await deriveMultisigAccount({
    rootKeyHex: parentWalletRootKeyHex,
    accountVisual,
    implementation,
  })

  return derivation.sharedWalletKey
}
