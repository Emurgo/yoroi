import {linksCardanoModuleMaker} from '@yoroi/links'

import * as React from 'react'

import type {WalletEncryptedStorage} from '@yoroi/cardano-wallet/dependencies'

import {useSelectedWallet} from './useSelectedWallet'
import {useWalletManagerSelector} from '../context/WalletManagerProvider'

export const useGenerateWalletLink = () => {
  const {wallet, meta} = useSelectedWallet()
  // Get makeWalletEncryptedStorage from wallet manager context
  // TODO: This should be exposed via WalletManager context or passed as dependency
  // For now, accessing it via a workaround - needs proper dependency injection
  const makeWalletEncryptedStorage = React.useCallback(
    (id: string): WalletEncryptedStorage => {
      // This is a temporary solution - the function should come from WalletManager dependencies
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {makeWalletEncryptedStorage: makeStorage} = require('~/kernel/storage/EncryptedStorage')
      return makeStorage(id)
    },
    [],
  )
  const [generatedLink, setGeneratedLink] = React.useState<string | null>(null)

  const generateFullWalletLinkFromRootKey = async (password: string) => {
    try {
      const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
      const rootKeyResult = await encryptedStorage.xpriv.read(password)
      const rootKeyHex = rootKeyResult.value

      const cardanoLinks = linksCardanoModuleMaker()
      const link = cardanoLinks.create({
        config: {
          scheme: 'web+cardano',
          authority: 'wallet',
          version: 'v1',
          rules: {
            requiredParams: ['type'],
            optionalParams: [
              'mnemonic',
              'rootKey',
              'accountPubKey',
              'encryption',
              'name',
              'implementation',
              'addressMode',
              'accountVisual',
            ],
            forbiddenParams: [],
            extraParams: 'drop',
          },
        },
        params: {
          type: 'full',
          rootKey: rootKeyHex,
          encryption: 'plain',
          name: meta.name,
          implementation: meta.implementation,
          addressMode: meta.addressMode,
          accountVisual: wallet.accountVisual.toString(),
        },
      })

      return link.link
    } catch (error) {
      throw error
    }
  }

  const generateReadOnlyWalletLink = async () => {
    try {
      const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
      const accountPubKeyHex = await encryptedStorage.xpub.read(
        wallet.accountVisual,
      )

      if (!accountPubKeyHex) {
        throw new Error('Account public key not found')
      }

      const cardanoLinks = linksCardanoModuleMaker()
      const link = cardanoLinks.create({
        config: {
          scheme: 'web+cardano',
          authority: 'wallet',
          version: 'v1',
          rules: {
            requiredParams: ['type'],
            optionalParams: [
              'mnemonic',
              'rootKey',
              'accountPubKey',
              'encryption',
              'name',
              'implementation',
              'addressMode',
              'accountVisual',
            ],
            forbiddenParams: [],
            extraParams: 'drop',
          },
        },
        params: {
          type: 'readonly',
          accountPubKey: accountPubKeyHex,
          encryption: 'plain',
          name: meta.name,
          implementation: meta.implementation,
          addressMode: meta.addressMode,
          accountVisual: wallet.accountVisual.toString(),
        },
      })

      return link.link
    } catch (error) {
      throw error
    }
  }

  return {
    generateFullWalletLinkFromRootKey,
    generateReadOnlyWalletLink,
    generatedLink,
    setGeneratedLink,
  }
}
