// @ts-expect-error - Missing dependency, should be added to devDependencies
import {linksCardanoModuleMaker} from '@yoroi/links'
import type {WalletEncryptedStorage} from '@yoroi/cardano-wallet'

import * as React from 'react'

import {useSelectedWallet} from './useSelectedWallet'

/**
 * Hook to generate wallet links
 * @param makeWalletEncryptedStorage - Factory function to create encrypted storage for a wallet
 */
export const useGenerateWalletLink = (
  makeWalletEncryptedStorage: (id: string) => WalletEncryptedStorage,
) => {
  const {wallet, meta} = useSelectedWallet()
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
