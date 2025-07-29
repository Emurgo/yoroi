import {Transaction} from '@emurgo/cross-csl-core'
import {useAsyncStorage} from '@yoroi/common'
import {DappConnection, DappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation'
import {cip30LedgerExtensionMaker} from '~/wallets/cardano/cip30/cip30-ledger'
import {YoroiWallet} from '~/wallets/cardano/types'
import {BaseLedgerError} from '~/wallets/hw/hw'
import {isEmptyString} from '~/wallets/utils/string'
import {usePromptRootKey} from '../ReviewTx/common/hooks/usePromptRootKey'
import {CreatedByInfoItem} from '../ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab'
import {getCollateralAmountInLovelace} from '../Settings/useCases/changeWalletSettings/ManageCollateral/helpers'
import {useBrowser} from './common/BrowserProvider'
import {useConfirmHWConnectionModal} from './common/ConfirmHWConnectionModal'
import {userRejectedError} from './common/errors'
import {createDappConnector} from './common/helpers'
import {useConfirmConnection} from './common/useConfirmConnection'
import {useNavigateTo} from './common/useNavigateTo'
import {useStrings} from './common/useStrings'

export const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {navigateToTxReview} = useWalletNavigation()
  const {tabs, tabActiveIndex} = useBrowser()
  const {track} = useMetrics()
  const dappCollateralRequestUtils = useDappCollateralRequestUtils(wallet)

  const activeTab = tabs[tabActiveIndex]
  const activeTabUrl = activeTab?.url ?? ''
  const activeTabOrigin =
    activeTabUrl === '' ? null : new URL(activeTabUrl).origin

  const confirmConnection = useConfirmConnection()

  const signData = useSignData()
  const signDataWithHW = useSignDataWithHW()

  const handleSignTx = React.useCallback(
    ({cbor, manager}: {cbor: string; manager: DappConnector}) => {
      return new Promise<string>((resolve, reject) => {
        let shouldResolve = true
        return manager.getDAppList().then(async ({dapps}) => {
          const dappsConnected = await manager.listAllConnections()
          const matchingDappConnection =
            activeTabOrigin != null
              ? dappsConnected.find((dapp) =>
                  dapp.dappOrigin.includes(activeTabOrigin),
                )
              : null

          if (matchingDappConnection?.dappOrigin != null) {
            const isDappRequestingCollateral =
              dappCollateralRequestUtils.getIsDappRequestingCollateral(
                matchingDappConnection.dappOrigin,
              )

            if (isDappRequestingCollateral) {
              if (!dappCollateralRequestUtils.hasCollateral()) {
                dappCollateralRequestUtils.showCollateralNotFoundAlert()
                reject(new Error('handleSignTx:: collateral needed'))
                return
              }

              dappCollateralRequestUtils.removeCollateralRequestedDappsId(
                matchingDappConnection.dappOrigin,
              )
            }
          }

          const matchingDapp =
            activeTabOrigin != null
              ? dapps.find((dapp) => dapp.origins.includes(activeTabOrigin))
              : null

          track.dappPopupSignTransactionPageViewed()
          navigateToTxReview({
            cbor,
            preventSubmit: true,
            createdBy: matchingDapp != null && (
              <CreatedByInfoItem
                logo={matchingDapp.logo}
                url={matchingDapp.uri}
              />
            ),
            onSuccess: (args) => {
              shouldResolve = false
              if (isEmptyString(args?.rootKey) || args?.rootKey == null) {
                reject(
                  new Error(
                    'useDappConnectorManager::handleSignTx: invalid state',
                  ),
                )
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
              if (shouldResolve) {
                shouldResolve = false
                reject(userRejectedError())
              }
            },
            onError: (error) => {
              shouldResolve = false
              logger.error('useDappConnectorManager::handleSignTx', {error})
              reject(error)
            },
          })
        })
      })
    },
    [
      activeTabOrigin,
      track,
      navigateToTxReview,
      dappCollateralRequestUtils,
      navigateTo,
    ],
  )

  const handleSignTxWithHW = React.useCallback(
    ({
      cbor,
      partial,
      manager,
    }: {
      cbor: string
      partial?: boolean
      manager: DappConnector
    }) => {
      track.dappPopupSignTransactionPageViewed()
      return new Promise<Transaction>((resolve, reject) => {
        let shouldResolve = true
        return manager.getDAppList().then(({dapps}) => {
          const matchingDapp =
            activeTabOrigin != null
              ? dapps.find((dapp) => dapp.origins.includes(activeTabOrigin))
              : null
          navigateToTxReview({
            cbor,
            partial,
            preventSubmit: true,
            createdBy: matchingDapp != null && (
              <CreatedByInfoItem
                logo={matchingDapp.logo}
                url={matchingDapp.uri}
              />
            ),
            onSuccess: (args) => {
              shouldResolve = false
              if (!args?.tx) {
                reject(
                  new Error(
                    'useDappConnectorManager::handleSignTxWithHW: invalid state',
                  ),
                )
                return
              }
              resolve(args?.tx)
              navigateTo.browseDapp()
            },
            onError: (error) => {
              shouldResolve = false
              logger.error('useDappConnectorManager::handleSignTxWithHW', {
                error,
              })
              reject(error)
            },
            onCancel: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
            onClose: () => {
              if (!shouldResolve) return
              shouldResolve = false
              reject(userRejectedError())
            },
          })
        })
      })
    },
    [track, activeTabOrigin, navigateToTxReview, navigateTo],
  )

  const handleSendReorganisationTx = React.useCallback(
    async ({manager}: {manager: DappConnector}) => {
      const dappsConnected = await manager.listAllConnections()
      const matchingDappConnection =
        activeTabOrigin != null
          ? dappsConnected.find((dapp) =>
              dapp.dappOrigin.includes(activeTabOrigin),
            )
          : null

      return new Promise<void>((resolve, reject) => {
        if (matchingDappConnection?.dappOrigin == null) {
          reject(new Error('handleSendReorganisationTx:: not matching dapp'))
          return
        }

        dappCollateralRequestUtils.addCollateralRequestedDappsId(
          matchingDappConnection.dappOrigin,
        )
        dappCollateralRequestUtils.showCollateralNotFoundAlert()

        resolve()
      })
    },
    [activeTabOrigin, dappCollateralRequestUtils],
  )

  return React.useMemo(
    () =>
      createDappConnector({
        appStorage,
        wallet,
        meta,
        confirmConnection,
        signTx: handleSignTx,
        signData,
        signTxWithHW: handleSignTxWithHW,
        signDataWithHW,
        sendReorganisationTx: handleSendReorganisationTx,
      }),
    [
      appStorage,
      wallet,
      meta,
      confirmConnection,
      handleSignTx,
      signData,
      handleSignTxWithHW,
      signDataWithHW,
      handleSendReorganisationTx,
    ],
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
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  return React.useCallback(
    (address: string, payload: string) => {
      return new Promise<{signature: string; key: string}>(
        (resolve, reject) => {
          let isClosed = false
          confirmHWConnection({
            onConfirm: async ({transportType, deviceInfo}) => {
              try {
                const cip30 = cip30LedgerExtensionMaker(wallet, meta)
                const result = await cip30.signData(
                  address,
                  payload,
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
    },
    [confirmHWConnection, wallet, meta, closeModal],
  )
}

export const useDappCollateralRequestUtils = (wallet: YoroiWallet) => {
  const [dappIds, setDappsIds] = React.useState<Array<string>>([])
  const {navigateToCollateralSettings} = useWalletNavigation()
  const [isWarningActive, setIsWarningActive] = React.useState(false)
  const {tabActiveIndex} = useBrowser()
  const strings = useStrings()
  const showCollateralNotFoundAlert = useShowCollateralNotFoundAlert({
    wallet,
    collateralTxPendingTitle: strings.collateralTxPendingTitle,
    collateralNotFoundTitle: strings.collateralNotFoundTitle,
    collateralTxPendingText: strings.collateralTxPendingText,
    collateralNotFoundText: strings.collateralNotFoundText,
    collateralNotFoundActionText: strings.collateralNotFoundActionText,
    onCollateralNotFoundPress: () => {
      navigateToCollateralSettings()
      setIsWarningActive(false)
    },
    onCollateralPendingPress: () => {
      setIsWarningActive(false)
    },
  })

  const addCollateralRequestedDappsId = (
    dappOrigin: DappConnection['dappOrigin'],
  ) => setDappsIds([...dappIds, prepareDappId(dappOrigin)])
  const removeCollateralRequestedDappsId = (
    dappOrigin: DappConnection['dappOrigin'],
  ) =>
    setDappsIds([...dappIds.filter((id) => id !== prepareDappId(dappOrigin))])
  const getIsDappRequestingCollateral = (
    dappOrigin: DappConnection['dappOrigin'],
  ) => dappIds.includes(prepareDappId(dappOrigin))
  const hasCollateral = () => {
    const collateral = wallet.getCollateralInfo()
    return (
      !!collateral.utxo &&
      collateral.amount.quantity >= BigInt(getCollateralAmountInLovelace())
    )
  }
  const prepareDappId = (dappOrigin: DappConnection['dappOrigin']) =>
    `${dappOrigin}-${tabActiveIndex}`

  return {
    collateralRequestedDappsIds: dappIds,
    addCollateralRequestedDappsId,
    removeCollateralRequestedDappsId,
    getIsDappRequestingCollateral,
    getCollateralId: () => wallet.getCollateralInfo().collateralId,
    showCollateralNotFoundAlert: () => {
      if (!isWarningActive) {
        setIsWarningActive(true)
        showCollateralNotFoundAlert()
      }
    },
    hasCollateral,
  }
}
