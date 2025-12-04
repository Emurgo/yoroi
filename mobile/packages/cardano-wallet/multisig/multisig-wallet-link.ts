/**
 * Utilities for creating multisig wallet restoration links/QR codes
 */
import {configCardanoWalletV1} from '@yoroi/links/cardano/constants'
import {linksCardanoModuleMaker} from '@yoroi/links/cardano/module'
import {Wallet} from '@yoroi/types'

/**
 * Multisig wallet setup JSON structure
 * Matches the structure used in ShareWalletDetailsScreen
 */
export type MultisigWalletSetupJSON = {
  version: string
  metadata: {
    walletId: string
    walletName: string
    createdAt: string
    network: string
  }
  multisig: {
    coSigners: ReadonlyArray<Wallet.CoSigner>
    quorumRules: Wallet.QuorumRules
    paymentScriptCbor: Wallet.ScriptCbor
    stakingScriptCbor: Wallet.ScriptCbor
  }
}

/**
 * Parameters for creating a multisig wallet restoration link
 */
type CreateMultisigWalletLinkParams = {
  readonly multisigSetup: MultisigWalletSetupJSON
  readonly name?: string // Optional wallet name override
}

/**
 * Create a restoration link/QR code for a multisig wallet
 * The link can be opened by co-signers to restore the multisig wallet
 *
 * @param params - Multisig wallet setup data
 * @returns URL string that can be used as a link or QR code
 */
export const createMultisigWalletLink = ({
  multisigSetup,
  name,
}: CreateMultisigWalletLinkParams): string => {
  // Encode multisig setup JSON as base64
  const jsonString = JSON.stringify(multisigSetup)
  const base64Encoded = Buffer.from(jsonString, 'utf8').toString('base64')

  // Create wallet restoration link
  const linksModule = linksCardanoModuleMaker()
  const link = linksModule.create({
    config: configCardanoWalletV1,
    params: {
      type: 'multisig',
      multisigSetup: base64Encoded,
      name: name ?? multisigSetup.metadata.walletName,
    },
  })

  return link.link
}

/**
 * Parse multisig wallet setup from a restoration link
 *
 * @param link - The restoration link URL
 * @returns Parsed multisig wallet setup JSON, or null if invalid
 */
export const parseMultisigWalletLink = (
  link: string,
): MultisigWalletSetupJSON | null => {
  try {
    const linksModule = linksCardanoModuleMaker()
    const parsed = linksModule.parse(link)

    if (!parsed || parsed.config.authority !== 'wallet') {
      return null
    }

    const type = parsed.params.type
    if (type !== 'multisig') {
      return null
    }

    const multisigSetupParam = parsed.params.multisigSetup
    if (!multisigSetupParam || typeof multisigSetupParam !== 'string') {
      return null
    }

    // Decode base64
    const jsonString = Buffer.from(multisigSetupParam, 'base64').toString(
      'utf8',
    )
    const multisigSetup = JSON.parse(jsonString) as MultisigWalletSetupJSON

    // Validate structure
    if (
      !multisigSetup.version ||
      !multisigSetup.metadata ||
      !multisigSetup.multisig ||
      !Array.isArray(multisigSetup.multisig.coSigners) ||
      !multisigSetup.multisig.quorumRules ||
      !multisigSetup.multisig.paymentScriptCbor ||
      !multisigSetup.multisig.stakingScriptCbor
    ) {
      return null
    }

    return multisigSetup
  } catch {
    return null
  }
}
