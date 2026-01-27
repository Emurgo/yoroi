import {linksCardanoModuleMaker} from '@yoroi/links'
import {Branded, Links} from '@yoroi/types'

import {freeze} from 'immer'

import {logger} from '~/kernel/logger/logger'

/**
 * Detects if a Cardano address is a testnet address
 * Testnet addresses start with 'addr_test1' prefix
 * @param address - The address to check
 * @returns 'preprod' for testnet addresses, 'mainnet' for mainnet addresses
 */
const detectNetwork = (address: string): 'mainnet' | 'preprod' => {
  return address.startsWith('addr_test1') ? 'preprod' : 'mainnet'
}

/**
 * Parse a Cardano link string into a CardanoAction.
 * Handles web+cardano:// links and converts them to structured actions.
 */
export const parseCardanoLink = (codeContent: string): Links.CardanoAction => {
  const isPossibleLink = codeContent.includes(':')

  // NOTE: if it is a string < 256 with valid characters, it'd be consider a Yoroi Receiver (wallet address | domain name)
  if (!isPossibleLink) {
    if (codeContent.length > 255 || !nonProtocolRegex.test(codeContent))
      throw new Links.Errors.UnknownContent()
    return freeze({
      action: 'send-only-receiver',
      receiver: Branded.asAddress(codeContent),
      network: detectNetwork(codeContent),
    } as const)
  }

  if (isOpenableLink(codeContent)) {
    return freeze({
      action: 'launch-url',
      url: codeContent,
    } as const)
  }

  const cardanoLinks = linksCardanoModuleMaker()
  const parsedCardanoLink = cardanoLinks.parse(codeContent)

  if (parsedCardanoLink === undefined) {
    logger.error(
      'parseCardanoLink: Cardano link parsing failed - scheme not implemented',
    )
    throw new Links.Errors.SchemeNotImplemented()
  }

  const {authority} = parsedCardanoLink.config

  // Handle claim authority
  if (authority === 'claim') {
    const {faucet_url: url, code, ...params} = parsedCardanoLink.params
    return freeze(
      {
        action: 'claim',
        url: typeof url === 'string' ? url : '',
        code: typeof code === 'string' ? code : '',
        params: params as Record<string, unknown>,
      } as const,
      true,
    ) as Links.CardanoAction
  }

  // Handle browse authority (CIP-158)
  if (authority === 'browse') {
    const {scheme, namespaced_domain, app_path, url, ...queryParams} =
      parsedCardanoLink.params
    if (typeof namespaced_domain !== 'string') {
      throw new Links.Errors.ParamsValidationFailed(
        'namespaced_domain must be a string',
      )
    }
    const reversedDomain = namespaced_domain.split('.').reverse().join('.')
    const queryString =
      Object.keys(queryParams).length > 0
        ? '?' +
          new URLSearchParams(queryParams as Record<string, string>).toString()
        : ''
    return freeze({
      action: 'browse-dapp',
      scheme: scheme as string,
      domain: reversedDomain,
      path: app_path as string | undefined,
      url: url as string,
      query: queryString || undefined,
    } as const)
  }

  // Handle pay authority (CIP-PR843)
  if (authority === 'pay') {
    const {address, amount, asset, memo} = parsedCardanoLink.params
    // Defensive validation: While @yoroi/links library validates required params,
    // we guard against undefined to prevent TypeError in detectNetwork()
    if (typeof address !== 'string') {
      throw new Links.Errors.ParamsValidationFailed(
        'address parameter is required',
      )
    }
    return freeze({
      action: 'pay-request',
      address: Branded.asAddress(address),
      network: detectNetwork(address),
      amount: amount ? Branded.asBalanceQuantity(String(amount)) : undefined,
      asset: asset as string | undefined,
      memo: memo as string | undefined,
    } as const)
  }

  // Handle payment authority (CIP-13)
  if (authority === 'payment') {
    const {address, amount, asset, memo} = parsedCardanoLink.params
    // Defensive validation: While @yoroi/links library validates required params,
    // we guard against undefined to prevent TypeError in detectNetwork()
    if (typeof address !== 'string') {
      throw new Links.Errors.ParamsValidationFailed(
        'address parameter is required',
      )
    }
    return freeze({
      action: 'pay-request',
      address: Branded.asAddress(address),
      network: detectNetwork(address),
      amount: amount ? Branded.asBalanceQuantity(String(amount)) : undefined,
      asset: asset as string | undefined,
      memo: memo as string | undefined,
    } as const)
  }

  // Handle stake authority (CIP-13)
  if (authority === 'stake') {
    const {pool} = parsedCardanoLink.params
    return freeze({
      action: 'stake-pool',
      pool: pool as string,
    } as const)
  }

  // Handle drep authority (DRep delegation)
  if (authority === 'drep') {
    const {drep} = parsedCardanoLink.params
    // DRep ID from deeplink can be bech32 format (drep1...), not just hex
    // asDRepId will warn if not hex but still cast it - parsing happens later
    return freeze({
      action: 'delegate-drep',
      drep: Branded.asDRepId(drep as string),
    } as const)
  }

  // Handle transaction authority (CIP-107)
  if (authority === 'transaction') {
    const {hash} = parsedCardanoLink.params
    return freeze({
      action: 'view-transaction',
      hash: Branded.asTransactionHash(hash as string),
    } as const)
  }

  // Handle block authority (CIP-107)
  if (authority === 'block') {
    const {hash, height} = parsedCardanoLink.params
    return freeze({
      action: 'view-block',
      hash: hash ? Branded.asBlockHash(hash as string) : undefined,
      height: height ? String(height) : undefined,
    } as const)
  }

  // Handle address authority (CIP-134)
  if (authority === 'address') {
    const {address} = parsedCardanoLink.params
    // Defensive validation: While @yoroi/links library validates required params,
    // we guard against undefined to prevent TypeError in detectNetwork()
    if (typeof address !== 'string') {
      throw new Links.Errors.ParamsValidationFailed(
        'address parameter is required',
      )
    }
    return freeze({
      action: 'view-address',
      address: Branded.asAddress(address),
      network: detectNetwork(address),
    } as const)
  }

  // Handle connect authority (P2P connections)
  if (authority === 'connect') {
    const {dappPeer, host, port, path, secure} = parsedCardanoLink.params

    return freeze({
      action: 'p2p-connect',
      dappPeer: dappPeer as string,
      host: host as string | undefined,
      port: port as string | undefined,
      path: path as string | undefined,
      secure: secure as boolean | undefined,
    } as const)
  }

  // Handle wallet authority (wallet restoration)
  if (authority === 'wallet') {
    const {
      type,
      mnemonic,
      rootKey,
      accountPubKey,
      encryption,
      name,
      implementation,
      addressMode,
      accountVisual,
    } = parsedCardanoLink.params

    return freeze({
      action: 'restore-wallet',
      type: type as 'full' | 'readonly',
      mnemonic: mnemonic as string | undefined,
      rootKey: rootKey as string | undefined,
      accountPubKey: accountPubKey as string | undefined,
      encryption: encryption as string | undefined,
      name: name as string | undefined,
      implementation: implementation as string | undefined,
      addressMode: addressMode as string | undefined,
      accountVisual: accountVisual as string | undefined,
    } as const)
  }

  // LEGACY COMPATIBILITY: Handle legacy transfer (empty authority)
  // This handles the old format where address was in the path
  if (authority === '') {
    const {address: receiver, amount, memo, message} = parsedCardanoLink.params
    const receiverStr = typeof receiver === 'string' ? receiver : ''
    return freeze(
      {
        action: 'send-single-pt',
        receiver: receiverStr,
        network: detectNetwork(receiverStr),
        params: {
          amount:
            typeof amount === 'string' || typeof amount === 'number'
              ? String(amount)
              : undefined,
          memo: typeof memo === 'string' ? memo : undefined,
          message: typeof message === 'string' ? message : undefined,
        },
      } as const,
      true,
    ) as Links.CardanoAction
  }

  // Fallback: if we don't recognize the authority, treat as legacy transfer
  // This maintains backward compatibility
  const {address: receiver, amount, memo, message} = parsedCardanoLink.params
  const receiverStr = typeof receiver === 'string' ? receiver : ''
  return freeze(
    {
      action: 'send-single-pt',
      receiver: receiverStr,
      network: detectNetwork(receiverStr),
      params: {
        amount:
          typeof amount === 'string' || typeof amount === 'number'
            ? String(amount)
            : undefined,
        memo: typeof memo === 'string' ? memo : undefined,
        message: typeof message === 'string' ? message : undefined,
      },
    } as const,
    true,
  ) as Links.CardanoAction
}

/**
 * Parse legacy yoroi-frontend public key QR code format.
 * Legacy format is a JSON object: { publicKeyHex: string, path: Array<number> }
 * This format was used in yoroi-frontend before the web+cardano:// link format.
 */
export const parseLegacyPublicKeyQR = (
  codeContent: string,
): Links.CardanoAction | null => {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(codeContent)

    // Check if it matches the legacy format
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.publicKeyHex === 'string' &&
      parsed.publicKeyHex.length > 0
    ) {
      // Validate that publicKeyHex looks like a valid hex string
      // Account public keys are typically 128 hex characters (64 bytes)
      if (!/^[0-9a-fA-F]+$/.test(parsed.publicKeyHex)) {
        return null
      }

      // Extract accountVisual from path if present
      // The path is a BIP44 derivation path array: [purpose', coinType', account']
      // The last element is the hardened account index
      // To get accountVisual, subtract the hardened offset (0x80000000 = 2147483648)
      let accountVisual: number | undefined
      if (
        Array.isArray(parsed.path) &&
        parsed.path.length > 0 &&
        typeof parsed.path[parsed.path.length - 1] === 'number'
      ) {
        const hardenedAccountIndex = parsed.path[parsed.path.length - 1]
        const HARDENED_OFFSET = 0x80000000 // 2147483648
        // Extract unhardened account index
        accountVisual = hardenedAccountIndex - HARDENED_OFFSET
        // Validate it's a reasonable account index (non-negative)
        if (accountVisual < 0) {
          accountVisual = undefined
        }
      }

      // Convert legacy format to CardanoAction restore-wallet format
      return freeze({
        action: 'restore-wallet',
        type: 'readonly',
        accountPubKey: parsed.publicKeyHex,
        encryption: 'plain',
        accountVisual:
          accountVisual !== undefined ? String(accountVisual) : undefined,
        implementation: undefined,
        addressMode: undefined,
        name: undefined,
        mnemonic: undefined,
        rootKey: undefined,
      } as const)
    }
  } catch {
    // Not valid JSON, return null to indicate it's not the legacy format
    return null
  }

  return null
}

const nonProtocolRegex = /^[a-zA-Z0-9_\-.$]+$/
const isOpenableLink = (content: string) => {
  return content.startsWith('yoroi') || content.startsWith('https')
}
