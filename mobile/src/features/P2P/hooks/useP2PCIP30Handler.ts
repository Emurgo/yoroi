import {cip30ExtensionMaker} from '@yoroi/cardano-wallet'
import {
  type ConnectionManager,
  type WalletMessage,
  type WalletRequest,
  type WalletResponse,
} from '@yoroi/p2p-communication'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {Buffer} from 'buffer'
import * as React from 'react'

import {userRejectedError} from '~/features/Discover/common/errors'
import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

type P2PCIP30HandlerOptions = {
  connectionManager: ConnectionManager | null
}

export const useP2PCIP30Handler = ({
  connectionManager,
}: P2PCIP30HandlerOptions) => {
  const {wallet, meta} = useSelectedWallet()
  const {navigateToTxReview} = useWalletNavigation()
  const {promptRootKey} = usePromptRootKey()
  const strings = useStrings()

  const handleMessage = React.useCallback(
    (message: WalletMessage) => {
      if (!connectionManager || message.type !== 'request') {
        return
      }

      const request = message as WalletRequest
      const peerConnection = connectionManager.getPeerConnection()
      const walletCommunication = connectionManager.getWalletCommunication()

      if (!peerConnection || !walletCommunication) {
        return
      }

      const sendResponse = (result: unknown, error?: string): void => {
        const response: WalletResponse = {
          type: 'response',
          method: request.method,
          data: result,
          error,
          id: request.id,
        }
        walletCommunication.sendMessage(JSON.stringify(response))
      }

      const handleMethod = async () => {
        try {
          if (!wallet || !meta) {
            sendResponse(null, 'No wallet selected')
            return
          }

          const cip30 = cip30ExtensionMaker(wallet, meta)

          switch (request.method) {
            case 'getBalance': {
              const balance = await cip30.getBalance()
              sendResponse(balance)
              break
            }

            case 'getUtxos': {
              const {amount, paginate} =
                (request.data as {
                  amount?: string
                  paginate?: {page: number; limit: number}
                }) || {}
              const utxos = await cip30.getUtxos(amount, paginate)
              sendResponse(utxos)
              break
            }

            case 'getUsedAddresses': {
              const {paginate} =
                (request.data as {
                  paginate?: {page: number; limit: number}
                }) || {}
              const addresses = await cip30.getUsedAddresses(paginate)
              sendResponse(addresses)
              break
            }

            case 'getUnusedAddresses': {
              const addresses = cip30.getUnusedAddresses()
              sendResponse(addresses)
              break
            }

            case 'getChangeAddress': {
              const address = await cip30.getChangeAddress()
              sendResponse(address)
              break
            }

            case 'getRewardAddresses': {
              const addresses = await cip30.getRewardAddresses()
              sendResponse(addresses)
              break
            }

            case 'getNetworkId': {
              const networkId = wallet.networkManager.chainId
              sendResponse(networkId)
              break
            }

            case 'getExtensions': {
              const extensions = [{cip: 30}]
              if (meta.implementation === 'cardano-cip1852') {
                extensions.push({cip: 95})
              }
              sendResponse(extensions)
              break
            }

            case 'getCollateral': {
              const {amount} = (request.data as {amount?: string}) || {}
              const collateral = await cip30.getCollateral(amount)
              sendResponse(collateral)
              break
            }

            case 'signTx': {
              const {cbor, partialSign} =
                (request.data as {
                  cbor: string
                  partialSign?: boolean
                }) || {}
              if (!cbor) {
                sendResponse(null, 'Missing cbor parameter')
                return
              }

              // Use the dApp connector's signTx handler which navigates to review screen
              // We need to adapt it for P2P context
              try {
                const rootKey = await new Promise<string>((resolve, reject) => {
                  let shouldResolve = true
                  navigateToTxReview({
                    cbor,
                    preventSubmit: true,
                    context: 'dapp',
                    onSuccessWithoutFeedback: (args) => {
                      shouldResolve = false
                      if (!args?.rootKey) {
                        reject(new Error('Invalid state: no rootKey'))
                        return
                      }
                      resolve(args.rootKey)
                    },
                    onCancel: () => {
                      if (!shouldResolve) return
                      shouldResolve = false
                      reject(new Error('User rejected'))
                    },
                    onClose: () => {
                      if (shouldResolve) {
                        shouldResolve = false
                        reject(new Error('User rejected'))
                      }
                    },
                    onErrorWithoutFeedback: (error) => {
                      shouldResolve = false
                      logger.error('P2P signTx error', {error})
                      reject(error)
                    },
                  })
                })

                const signedCbor = await cip30.signTx(
                  rootKey,
                  cbor,
                  partialSign,
                )
                sendResponse(signedCbor)
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : String(error)
                sendResponse(null, errorMessage)
              }
              break
            }

            case 'signData': {
              const {address, payload} =
                (request.data as {
                  address: string
                  payload: string
                }) || {}
              if (!address || !payload) {
                sendResponse(null, 'Missing address or payload parameter')
                return
              }

              // Prompt for root key and sign data
              try {
                const rootKey = await new Promise<string>((resolve, reject) => {
                  let shouldResolveOnClose = true
                  const title = strings.discover.signData
                  const summary = `${strings.discover.signMessage}: ${Buffer.from(payload, 'hex').toString('utf-8')}`
                  try {
                    promptRootKey({
                      title,
                      summary,
                      onSuccess: (key) => {
                        shouldResolveOnClose = false
                        resolve(key)
                        return Promise.resolve()
                      },
                      onClose: () => {
                        if (shouldResolveOnClose) {
                          reject(userRejectedError())
                        }
                      },
                    })
                  } catch (error) {
                    reject(error)
                  }
                })

                const cip30 = cip30ExtensionMaker(wallet, meta)
                const result = await cip30.signData(rootKey, address, payload)
                sendResponse(result)
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : String(error)
                sendResponse(null, errorMessage)
              }
              break
            }

            case 'submitTx': {
              const {cbor} = (request.data as {cbor: string}) || {}
              if (!cbor) {
                sendResponse(null, 'Missing cbor parameter')
                return
              }
              const txId = await cip30.submitTx(cbor)
              sendResponse(txId)
              break
            }

            default:
              sendResponse(null, `Unknown method: ${request.method}`)
          }
        } catch (error) {
          logger.error(
            error instanceof Error ? error : new Error(String(error)),
            {
              origin: 'useP2PCIP30Handler',
              method: request.method,
            },
          )
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          sendResponse(null, errorMessage)
        }
      }

      handleMethod()
    },
    [
      connectionManager,
      wallet,
      meta,
      navigateToTxReview,
      promptRootKey,
      strings.discover.signData,
      strings.discover.signMessage,
    ],
  )

  return {handleMessage}
}
