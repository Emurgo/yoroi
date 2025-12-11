import {cip30ExtensionMaker} from '@yoroi/cardano-wallet'
import {cip30LedgerExtensionMaker} from '@yoroi/cardano-wallet'
import {BaseLedgerError} from '@yoroi/cardano-wallet'
import {useAddressMode} from '@yoroi/wallet-manager'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {Buffer} from 'buffer'
import * as React from 'react'

import {useConfirmHWConnectionModal} from '~/features/Discover/common/ConfirmHWConnectionModal'
import {userRejectedError} from '~/features/Discover/common/errors'
import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {useStrings} from '~/kernel/i18n/useStrings'

export const useMessageSigning = () => {
  const {wallet, meta} = useSelectedWallet()
  const {addressMode} = useAddressMode()
  const {promptRootKey} = usePromptRootKey()
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const strings = useStrings()

  const signMessage = React.useCallback(
    (
      message: string,
      selectedAddress?: string,
    ): Promise<{signature: string; key: string}> => {
      const payloadHex = Buffer.from(message, 'utf-8').toString('hex')
      const address = selectedAddress || wallet.getChangeAddress(addressMode)

      if (meta.isHW) {
        // Hardware wallet signing
        return new Promise<{signature: string; key: string}>(
          (resolve, reject) => {
            let isClosed = false
            confirmHWConnection({
              onConfirm: async ({transportType, deviceInfo}) => {
                try {
                  const cip30 = cip30LedgerExtensionMaker(wallet, meta, {
                    toLedgerSignRequest:
                      wallet._dependencies.toLedgerSignRequest,
                  })
                  const result = await cip30.signData(
                    address,
                    payloadHex,
                    deviceInfo,
                    transportType === 'USB',
                  )
                  resolve(result)
                  isClosed = true
                  closeModal()
                } catch (error) {
                  if (error instanceof BaseLedgerError) {
                    throw error
                  }
                  reject(error)
                  isClosed = true
                  closeModal()
                }
              },
              onCancel: () => {
                reject(userRejectedError())
                isClosed = true
                closeModal()
              },
              onClose: () => {
                if (isClosed) return
                reject(userRejectedError())
              },
            })
          },
        )
      } else {
        // Regular wallet signing
        return new Promise<{signature: string; key: string}>(
          (resolve, reject) => {
            let shouldResolveOnClose = true
            const title = strings.discover.signData
            const messagePreview =
              message.length > 50 ? `${message.slice(0, 50)}...` : message
            const summary = `${strings.discover.signMessage}: ${messagePreview}`
            try {
              promptRootKey({
                title,
                summary,
                onSuccess: async (rootKey) => {
                  shouldResolveOnClose = false
                  try {
                    const cip30 = cip30ExtensionMaker(wallet, meta, {
                      createCollateralEntry:
                        wallet._dependencies.createCollateralEntry,
                    })
                    const result = await cip30.signData(
                      rootKey,
                      address,
                      payloadHex,
                    )
                    resolve(result)
                  } catch (error) {
                    reject(error)
                  }
                  return Promise.resolve()
                },
                onClose: () => {
                  if (shouldResolveOnClose) reject(userRejectedError())
                },
                onError: (error) => {
                  reject(error)
                },
              })
            } catch (error) {
              reject(error)
            }
          },
        )
      }
    },
    [
      wallet,
      meta,
      addressMode,
      promptRootKey,
      confirmHWConnection,
      closeModal,
      strings.discover.signData,
      strings.discover.signMessage,
    ],
  )

  return {signMessage}
}
