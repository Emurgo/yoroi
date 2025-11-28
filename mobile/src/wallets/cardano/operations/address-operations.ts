import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {App, Wallet} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'

import {throwLoggedError} from '~/kernel/logger/helpers/throw-logged-error'

import {CardanoMobile} from '../../wallets'
import {AccountManager, Addresses} from '../account-manager/account-manager'
import type {ReadOnlyAccountManager} from '../account-manager/read-only-account-manager'

/**
 * Get change address for a wallet
 */
export const getChangeAddress = (
  wallet: {
    externalChain:
      | AccountManager['externalChain']
      | ReadOnlyAccountManager['externalChain']
    internalChain:
      | AccountManager['internalChain']
      | ReadOnlyAccountManager['internalChain']
    isUsedAddress: (address: string) => boolean
  },
  addressMode: Wallet.AddressMode,
): string => {
  const externalAddress = wallet.externalChain.addresses[0]
  if (!externalAddress) {
    throw new App.Errors.InvalidState('No External Address')
  }

  // SA mode uses only externalChain index 0
  if (addressMode === 'single') return externalAddress

  const candidateAddresses = wallet.internalChain.addresses
  const unseen = candidateAddresses.filter(
    (addr: string) => !wallet.isUsedAddress(addr),
  )
  const [changeAddress] = unseen
  if (!changeAddress) {
    throwLoggedError('getChangeAddress: unable to resolve change address')
  }
  return changeAddress
}

/**
 * Get addressing information for an address
 */
export const getAddressing = (
  address: string,
  wallet: {
    publicKeyHex: string
    accountVisual: number
    internalChain:
      | AccountManager['internalChain']
      | ReadOnlyAccountManager['internalChain']
    externalChain:
      | AccountManager['externalChain']
      | ReadOnlyAccountManager['externalChain']
  },
  implementation: Wallet.Implementation,
):
  | {path: number[]; startLevel: number}
  | {
      path: []
      startLevel: number
      isReadOnly: true
      chain: 'internal' | 'external'
      index: number
    } => {
  const startLevel = derivationConfig.keyLevel.purpose
  const implementationConfig = cardanoConfig.implementations[implementation]

  // Check if this is a read-only wallet (no accountPubKeyHex means read-only)
  const isReadOnly = !wallet.publicKeyHex || wallet.publicKeyHex === ''

  if (wallet.internalChain.isMyAddress(address)) {
    if (isReadOnly) {
      // For read-only wallets, return minimal addressing info
      return {
        path: [], // Empty path - we don't know the derivation
        startLevel,
        isReadOnly: true,
        chain: 'internal' as const,
        index: wallet.internalChain.getIndexOfAddress(address),
      }
    }

    const path = [
      implementationConfig.derivations.base.harden.purpose,
      implementationConfig.derivations.base.harden.coinType,
      wallet.accountVisual + derivationConfig.hardStart,
      implementationConfig.derivations.base.roles.internal,
      wallet.internalChain.getIndexOfAddress(address),
    ]
    return {
      path,
      startLevel,
    }
  }

  if (wallet.externalChain.isMyAddress(address)) {
    if (isReadOnly) {
      // For read-only wallets, return minimal addressing info
      return {
        path: [], // Empty path - we don't know the derivation
        startLevel,
        isReadOnly: true,
        chain: 'external' as const,
        index: wallet.externalChain.getIndexOfAddress(address),
      }
    }

    const path = [
      implementationConfig.derivations.base.harden.purpose,
      implementationConfig.derivations.base.harden.coinType,
      wallet.accountVisual + derivationConfig.hardStart,
      implementationConfig.derivations.base.roles.external,
      wallet.externalChain.getIndexOfAddress(address),
    ]
    return {
      path,
      startLevel,
    }
  }

  throwLoggedError(`getAddressing: missing address info for: ${address}`)
}

/**
 * Get first payment address (BaseAddress)
 */
export const getFirstPaymentAddress = (
  externalAddresses: string[],
): CSL.BaseAddress => {
  const externalAddress = externalAddresses[0]
  if (!externalAddress) {
    throw new App.Errors.InvalidState('No External Address')
  }
  const addr = CardanoMobile.Address.fromBech32(externalAddress)
  const address = CardanoMobile.BaseAddress.fromAddress(addr)
  if (!address) {
    throwLoggedError('getFirstPaymentAddress: invalid address')
  }
  return address
}

/**
 * Generate new receive address
 */
export const generateNewReceiveAddress = (wallet: {
  publicKeyHex: string
  externalChain:
    | AccountManager['externalChain']
    | ReadOnlyAccountManager['externalChain']
  receiveAddressInfo: () => Readonly<{canIncrease: boolean}>
  accountManager: AccountManager | ReadOnlyAccountManager
  notify: (event: {type: 'addresses'; addresses: Addresses}) => void
  receiveAddresses: () => Addresses
}): boolean => {
  const {canIncrease} = wallet.receiveAddressInfo()
  if (!canIncrease) return false

  // Read-only wallets can't generate new addresses
  if (!wallet.publicKeyHex || wallet.publicKeyHex === '') {
    return false
  }

  // Type guard: only AddressChain has increaseVisualIndex
  if ('increaseVisualIndex' in wallet.externalChain) {
    wallet.externalChain.increaseVisualIndex()
    wallet.accountManager.save()

    wallet.notify({type: 'addresses', addresses: wallet.receiveAddresses()})

    return true
  }

  return false
}
