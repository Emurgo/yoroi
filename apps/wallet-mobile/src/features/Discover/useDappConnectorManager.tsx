import {Transaction} from '@emurgo/cross-csl-core'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {InteractionManager} from 'react-native'

import {logger} from '../../kernel/logger/logger'
import {useWalletNavigation} from '../../kernel/navigation'
import {isEmptyString} from '../../kernel/utils'
import {usePromptRootKey} from '../ReviewTx/common/hooks/usePromptRootKey'
import {CreatedByInfoItem} from '../ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {useBrowser} from './common/BrowserProvider'
import {useOpenConfirmConnectionModal} from './common/ConfirmConnectionModal'
import {userRejectedError} from './common/errors'
import {createDappConnector} from './common/helpers'
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
            onSuccess: (args) => {
              shouldResolve = false
              if (isEmptyString(args?.rootKey) || args?.rootKey == null) {
                reject('useDappConnectorManager::handleSignTx: invalid state')
                return
              }

              resolve(args?.rootKey)
              navigateTo.browseDapp()
            },
            onCancel: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
            onClose: () => {
              if (shouldResolve) reject(userRejectedError())
            },
            onError: (error) => {
              logger.error('useDappConnectorManager::handleSignTx', {error})
              reject(error)
            },
          })
        })
      })
    },
    [activeTabOrigin, navigateToTxReview, navigateTo],
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
            partial,
            createdBy: matchingDapp != null && <CreatedByInfoItem logo={matchingDapp.logo} url={matchingDapp.uri} />,
            onSuccess: (args) => {
              shouldResolve = false
              if (!args?.tx) {
                reject('useDappConnectorManager::handleSignTxWithHW: invalid state')
                return
              }
              resolve(args?.tx)
              navigateTo.browseDapp()
            },
            onError: (error) => {
              logger.error('useDappConnectorManager::handleSignTxWithHW', {error})
              reject(error)
            },
            onCancel: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
            onClose: () => {
              if (!shouldResolve) return
              reject(userRejectedError())
            },
          })
        })
      })
    },
    [activeTabOrigin, navigateToTxReview, navigateTo],
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
  const {promptRootKey} = usePromptRootKey()
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
            onSuccess: (rootKey) => {
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
