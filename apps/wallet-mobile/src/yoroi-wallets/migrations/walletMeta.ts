/* eslint-disable @typescript-eslint/no-explicit-any */

import {parseSafe} from '@yoroi/common'

import {Logger} from '../../legacy/logging'
import {CardanoTypes, legacyWalletChecksum, walletChecksum} from '../cardano/types'
import {WALLETS} from '../cardano/utils'
import {rootStorage} from '../storage/rootStorage'
import type {NetworkId, WalletImplementationId} from '../types/other'
import {NETWORK_REGISTRY, WALLET_IMPLEMENTATION_REGISTRY} from '../types/other'
import {WalletMeta} from '../walletManager'

async function toShelleyWalletMeta(currentWalletMeta: Partial<WalletMeta>): Promise<WalletMeta> {
  if (!currentWalletMeta.id) throw new Error(`Wallet meta stored is corrupted. ${JSON.stringify(currentWalletMeta)}`)
  const walletData: any = await rootStorage.join('wallet/').join(`${currentWalletMeta.id}/`).getItem('data')
  const walletMetaUpdate: Partial<WalletMeta> = {...currentWalletMeta}

  // new fields added over time
  let networkId: NetworkId
  let walletImplementationId: WalletImplementationId
  let checksum: CardanoTypes.WalletChecksum

  // migrate networkId and walletImplementationId
  if (currentWalletMeta.networkId == null && currentWalletMeta.isShelley != null) {
    networkId = currentWalletMeta.isShelley ? NETWORK_REGISTRY.JORMUNGANDR : NETWORK_REGISTRY.HASKELL_SHELLEY
    walletImplementationId = currentWalletMeta.isShelley
      ? WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID
      : WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID
  } else {
    // if wallet implementation/network is not defined, assume Byron
    walletImplementationId =
      currentWalletMeta.walletImplementationId != null
        ? currentWalletMeta.walletImplementationId
        : WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID
    networkId =
      currentWalletMeta.networkId != null
        ? currentWalletMeta.networkId === NETWORK_REGISTRY.BYRON_MAINNET
          ? NETWORK_REGISTRY.HASKELL_SHELLEY
          : currentWalletMeta.networkId
        : NETWORK_REGISTRY.HASKELL_SHELLEY
  }

  // migrate checksum
  if (!currentWalletMeta.checksum || !currentWalletMeta.checksum?.ImagePart) {
    if (walletData != null && walletData?.externalChain?.addressGenerator != null) {
      const {accountPubKeyHex, account} = walletData.externalChain.addressGenerator
      switch (walletImplementationId) {
        case WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID:
          checksum = legacyWalletChecksum(accountPubKeyHex || account.root_cached_key)
          break
        case WALLETS.HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID:
        case WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID:
          checksum = walletChecksum(accountPubKeyHex)
          break
        case WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID:
          checksum = legacyWalletChecksum(account?.root_cached_key || '')
          break
        default:
          checksum = {ImagePart: '', TextPart: ''}
      }
    } else {
      checksum = {ImagePart: '', TextPart: ''}
    }
    // missing checksum
    walletMetaUpdate.checksum = checksum
    await migrateAttribute('checksum', walletMetaUpdate)
  }

  // resolving to a different implementation id
  if (currentWalletMeta?.walletImplementationId !== walletImplementationId) {
    walletMetaUpdate.walletImplementationId = walletImplementationId
    await migrateAttribute('walletImplementationId', walletMetaUpdate)
  }

  // resolving to a different network
  if (currentWalletMeta?.networkId !== networkId) {
    walletMetaUpdate.networkId = networkId
    await migrateAttribute('networkId', walletMetaUpdate)
  }

  // missing isHW
  if (!('isHW' in currentWalletMeta)) {
    walletMetaUpdate.isHW = walletData != null && walletData?.isHW != null ? walletData.isHW : false
    await migrateAttribute('isHW', walletMetaUpdate)
  }

  // missing isEasyConfirmationEnabled
  if (!('isEasyConfirmationEnabled' in currentWalletMeta)) {
    walletMetaUpdate.isEasyConfirmationEnabled = false
    await migrateAttribute('isEasyConfirmationEnabled', walletMetaUpdate)
  }

  if (isWalletMeta(walletMetaUpdate)) return walletMetaUpdate as WalletMeta

  Logger.error(`Invalid wallet meta `, JSON.stringify(walletMetaUpdate))
  throw new Error(`Wallet meta stored is corrupted. ${JSON.stringify(walletMetaUpdate)}`)
}

export async function migrateWalletMetas(currentWalletMetas: Array<Partial<WalletMeta>>): Promise<Array<WalletMeta>> {
  return Promise.all(currentWalletMetas.map(toShelleyWalletMeta))
}

function migrateAttribute(attr: keyof WalletMeta, walletMetaUpdated: Partial<WalletMeta>): Promise<void> {
  const id = walletMetaUpdated?.id
  if (id == null) throw new Error('invalid wallet id')
  Logger.warn(`migrateAttribute::${attr} of wallet ${id}`)
  return rootStorage.join('wallet/').setItem(id, walletMetaUpdated)
}

export const parseWalletMeta = (data: unknown) => {
  const parsed = parseSafe(data)

  return isWalletMeta(parsed) ? parsed : undefined
}

export function isWalletMeta(walletMeta: any): walletMeta is WalletMeta {
  return (
    // prettier-ignore
    !!walletMeta &&
    'id' in walletMeta
      && typeof walletMeta.id === 'string' &&
    'name' in walletMeta
      && typeof walletMeta.name === 'string' &&
    'networkId' in walletMeta
      && typeof walletMeta.networkId === 'number' &&
    'isHW' in walletMeta
      && typeof walletMeta.isHW === 'boolean' &&
    'isEasyConfirmationEnabled' in walletMeta
      && typeof walletMeta.isEasyConfirmationEnabled === 'boolean' &&
    'checksum' in walletMeta
      && typeof walletMeta.checksum === 'object' &&
    ('provider' in walletMeta
      && typeof walletMeta.provider === 'string'
      || !('provider' in walletMeta)) &&
    'walletImplementationId' in walletMeta
      && typeof walletMeta.walletImplementationId === 'string'
      && Object.values(WALLET_IMPLEMENTATION_REGISTRY).includes(walletMeta?.walletImplementationId) &&
    ('isShelley' in walletMeta
      && typeof walletMeta.isShelley === 'boolean'
      || !('isShelley' in walletMeta))
  )
}
