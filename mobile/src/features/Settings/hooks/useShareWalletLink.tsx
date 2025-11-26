import {linksCardanoModuleMaker} from '@yoroi/links'

import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'

export const useShareWalletLink = () => {
  const {wallet, meta} = useSelectedWallet()
  const [error, setError] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const generateFullWalletLink = React.useCallback(
    async (password: string): Promise<string> => {
      setIsGenerating(true)
      setError(null)

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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate link'
        setError(errorMessage)
        throw err
      } finally {
        setIsGenerating(false)
      }
    },
    [wallet, meta],
  )

  const generateReadOnlyWalletLink =
    React.useCallback(async (): Promise<string> => {
      setIsGenerating(true)
      setError(null)

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
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate link'
        setError(errorMessage)
        throw err
      } finally {
        setIsGenerating(false)
      }
    }, [wallet, meta])

  return {
    generateFullWalletLink,
    generateReadOnlyWalletLink,
    error,
    isGenerating,
  }
}
