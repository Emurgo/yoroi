import {Transaction} from '@emurgo/cross-csl-core'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {InteractionManager} from 'react-native'
import {useMutation} from 'react-query'

import {logger} from '../../kernel/logger/logger'
import {useWalletNavigation} from '../../kernel/navigation'
import {cip30LedgerExtensionMaker} from '../../yoroi-wallets/cardano/cip30/cip30-ledger'
import {BaseLedgerError} from '../../yoroi-wallets/hw/hw'
import {CreatedByInfoItem} from '../ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useBrowser} from './common/BrowserProvider'
import {useOpenConfirmConnectionModal} from './common/ConfirmConnectionModal'
import {useConfirmHWConnectionModal} from './common/ConfirmHWConnectionModal'
import {userRejectedError} from './common/errors'
import {createDappConnector} from './common/helpers'
import {usePromptRootKey} from './common/hooks'
import {useShowHWNotSupportedModal} from './common/HWNotSupportedModal'
import {useOpenUnverifiedDappModal} from './common/UnverifiedDappModal'
import {useNavigateTo} from './common/useNavigateTo'
import {useStrings} from './common/useStrings'

export const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {navigateToTxReview} = useWalletNavigation()
  const {tabs, tabActiveIndex} = useBrowser()
  const activeTab = tabs[tabActiveIndex]
  const activeTabUrl = activeTab?.url
  const activeTabOrigin = activeTabUrl === undefined ? null : new URL(activeTabUrl).origin

  const confirmConnection = useConfirmConnection()

  const signData = useSignData()
  const signDataWithHW = useSignDataWithHW()

  const promptRootKey = useConnectorPromptRootKey()
  const {sign: signTxWithHW} = useSignTxWithHW()

  const handleSignTx = React.useCallback(
    ({cbor, manager}: {cbor: string; manager: DappConnector}) => {
      return new Promise<string>((resolve, reject) => {
        let shouldResolve = true
        return manager.getDAppList().then(({dapps}) => {
          const matchingDapp =
            activeTabOrigin != null ? dapps.find((dapp) => dapp.origins.includes(activeTabOrigin)) : null
          navigateToTxReview({
            cbor,
            createdBy: matchingDapp != null && <CreatedByInfoItem logo={matchingDapp.logo} url={matchingDapp.uri} />,
            onConfirm: async () => {
              if (!shouldResolve) return
              shouldResolve = false
              const rootKey = await promptRootKey()
              resolve(rootKey)
              navigateTo.browseDapp()
            },
            onCancel: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
          })
        })
      })
    },
    [activeTabOrigin, navigateToTxReview, promptRootKey, navigateTo],
  )

  const handleSignTxWithHW = React.useCallback(
    ({cbor, partial, manager}: {cbor: string; partial?: boolean; manager: DappConnector}) => {
      return new Promise<Transaction>((resolve, reject) => {
        let shouldResolve = true
        return manager.getDAppList().then(({dapps}) => {
          const matchingDapp =
            activeTabOrigin != null ? dapps.find((dapp) => dapp.origins.includes(activeTabOrigin)) : null
          navigateToTxReview({
            cbor,
            createdBy: matchingDapp != null && <CreatedByInfoItem logo={matchingDapp.logo} url={matchingDapp.uri} />,
            onConfirm: () => {
              if (!shouldResolve) return
              shouldResolve = false
              signTxWithHW(
                {cbor, partial},
                {
                  onSuccess: (signature) => resolve(signature),
                  onError: (error) => {
                    logger.error('ReviewTransaction::handleOnConfirm', {error})
                    reject(error)
                  },
                },
              )
              navigateTo.browseDapp()
            },
            onCancel: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
          })
        })
      })
    },
    [activeTabOrigin, navigateToTxReview, navigateTo, signTxWithHW],
  )

  return React.useMemo(
    () =>
      createDappConnector({
        appStorage,
        wallet,
        confirmConnection,
        signTx: handleSignTx,
        signData,
        meta,
        signTxWithHW: handleSignTxWithHW,
        signDataWithHW,
      }),
    [appStorage, wallet, confirmConnection, handleSignTx, signData, meta, handleSignTxWithHW, signDataWithHW],
  )
}

const useSignData = () => {
  const promptRootKey = usePromptRootKey()
  const strings = useStrings()

  return React.useCallback(
    (_address: string, payload: string) => {
      return new Promise<string>((resolve, reject) => {
        let shouldResolveOnClose = true
        const title = strings.signData
        const summary = `${strings.signMessage}: ${Buffer.from(payload, 'hex').toString('utf-8')}`
        try {
          promptRootKey({
            title,
            summary,
            onConfirm: (rootKey) => {
              resolve(rootKey)
              shouldResolveOnClose = false
              return Promise.resolve()
            },
            onClose: () => {
              if (shouldResolveOnClose) reject(userRejectedError())
            },
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    [promptRootKey, strings.signData, strings.signMessage],
  )
}

const useSignDataWithHW = () => {
  const {showHWNotSupportedModal, closeModal} = useShowHWNotSupportedModal()

  return React.useCallback(() => {
    return new Promise<{signature: string; key: string}>((_resolve, reject) => {
      let shouldResolveOnClose = true
      showHWNotSupportedModal({
        onConfirm: () => {
          closeModal()
          shouldResolveOnClose = false
          return reject(userRejectedError())
        },
        onClose: () => {
          if (shouldResolveOnClose) reject(userRejectedError())
        },
      })
    })
  }, [showHWNotSupportedModal, closeModal])
}

const useConfirmConnection = () => {
  const {openConfirmConnectionModal} = useOpenConfirmConnectionModal()
  const {openUnverifiedDappModal, closeModal} = useOpenUnverifiedDappModal()
  return React.useCallback(
    async (origin: string, manager: DappConnector) => {
      const recommendedDApps = await manager.getDAppList()
      const selectedDapp = recommendedDApps.dapps.find((dapp) => dapp.origins.includes(origin))
      const name = selectedDapp?.name ?? origin
      const website = origin
      const logo = selectedDapp?.logo ?? ''
      const showSingleAddressWarning = selectedDapp?.isSingleAddress ?? false

      return new Promise<boolean>((resolve) => {
        const openMainModal = () => {
          openConfirmConnectionModal({
            name,
            website,
            logo,
            onConfirm: () => resolve(true),
            onClose: () => resolve(false),
            showSingleAddressWarning,
          })
        }

        if (!selectedDapp) {
          let shouldResolveOnClose = true
          openUnverifiedDappModal({
            onClose: () => {
              if (shouldResolveOnClose) resolve(false)
            },
            onConfirm: () => {
              shouldResolveOnClose = false
              closeModal()
              InteractionManager.runAfterInteractions(() => {
                openMainModal()
              })
            },
          })
          return
        }

        openMainModal()
      })
    },
    [openConfirmConnectionModal, openUnverifiedDappModal, closeModal],
  )
}

const useConnectorPromptRootKey = () => {
  const promptRootKey = usePromptRootKey()

  return React.useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      let shouldResolveOnClose = true

      try {
        promptRootKey({
          onConfirm: (rootKey) => {
            resolve(rootKey)
            shouldResolveOnClose = false
            return Promise.resolve()
          },
          onClose: () => {
            if (shouldResolveOnClose) reject(userRejectedError())
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }, [promptRootKey])
}

export const useSignTxWithHW = () => {
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  const mutationFn = React.useCallback(
    (options: {cbor: string; partial?: boolean}) => {
      return new Promise<Transaction>((resolve, reject) => {
        let isClosed = false
        confirmHWConnection({
          onConfirm: async ({transportType, deviceInfo}) => {
            try {
              const cip30 = cip30LedgerExtensionMaker(wallet, meta)
              const tx = await cip30.signTx(options.cbor, options.partial ?? false, deviceInfo, transportType === 'USB')
              resolve(tx)
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
      })
    },
    [confirmHWConnection, wallet, meta, closeModal],
  )

  const mutation = useMutation<Transaction, Error, {cbor: string; partial?: boolean}>({
    mutationFn,
    useErrorBoundary: false,
    mutationKey: ['useSignTxWithHW'],
  })

  return {...mutation, sign: mutation.mutate}
}
