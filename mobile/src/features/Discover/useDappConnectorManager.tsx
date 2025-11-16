import {useAsyncStorage} from '@yoroi/common'
import {DappConnection, DappConnector} from '@yoroi/dapp-connector'
import {calculateTxId} from '@yoroi/tx'

import {Transaction} from '@emurgo/cross-csl-core'
import {useNavigation} from '@react-navigation/native'
import {Buffer} from 'buffer'
import * as React from 'react'

import {CollateralInfoModal} from '~/features/Settings/ui/screens/ChangeWalletSettingsScreen/ManageCollateralScreen/CollateralInfoModal'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {removeRouteFromNavigationState} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {cip30ExtensionMaker} from '~/wallets/cardano/cip30/cip30'
import {cip30LedgerExtensionMaker} from '~/wallets/cardano/cip30/cip30-ledger'
import {YoroiWallet} from '~/wallets/cardano/types'
import {collateralConfig} from '~/wallets/cardano/utxoManager/utxos'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
import {BaseLedgerError} from '~/wallets/hw/hw'
import {isEmptyString} from '~/wallets/utils/string'

import {usePromptRootKey} from '../ReviewTx/common/hooks/usePromptRootKey'
import {CreatedByInfoItem} from '../ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab'
import {useBrowser} from './common/BrowserProvider'
import {useConfirmHWConnectionModal} from './common/ConfirmHWConnectionModal'
import {userRejectedError} from './common/errors'
import {createDappConnector} from './common/helpers'
import {useConfirmConnection} from './common/useConfirmConnection'
import {useDappList} from './common/useDappList'
import {useShowCollateralNotFoundAlert} from './common/useShowCollateralNotFoundAlert'

// Collateral creation notice component for operations section
const CollateralCreationNotice = () => {
  const strings = useStrings()
  return (
    <InfoBanner
      title={strings.discover.collateralCreationTitle}
      content={strings.discover.collateralCreationDescription}
    />
  )
}

export const useDappConnectorManager = () => {
  const appStorage = useAsyncStorage()
  const navigation = useNavigation()
  const {navigateToDiscoverBrowserDapp, navigateToTxReview} =
    useWalletNavigation()
  const {wallet, meta} = useSelectedWallet()
  const {tabs, tabActiveIndex} = useBrowser()
  const dappCollateralRequestUtils = useDappCollateralRequestUtils(wallet)
  const strings = useStrings()

  const activeTab = tabs[tabActiveIndex]
  const activeTabUrl = activeTab?.url ?? ''
  const activeTabOrigin =
    activeTabUrl === '' ? null : new URL(activeTabUrl).origin

  const confirmConnection = useConfirmConnection()

  const signData = useSignData()
  const signDataWithHW = useSignDataWithHW()

  const {data: dappList} = useDappList()

  const handleSignTx = React.useCallback(
    ({cbor, manager}: {cbor: string; manager: DappConnector}) => {
      return new Promise<string>(async (resolve, reject) => {
        let shouldResolve = true
        const dapps = dappList?.dapps || []
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

        navigateToTxReview({
          cbor,
          preventSubmit: true,
          context: 'dapp',
          createdBy: matchingDapp != null && (
            <CreatedByInfoItem
              logo={matchingDapp.logo}
              url={matchingDapp.uri}
              name={matchingDapp.name}
            />
          ),
          onSuccessWithoutFeedback: (args) => {
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
            navigateToDiscoverBrowserDapp()
            // Remove review-tx-routes from navigation stack after navigating back to browser
            // Use setTimeout to ensure navigation completes before removing the route
            // Increase maxDepth to ensure we traverse up to WalletNavigator where review-tx-routes is located
            setTimeout(() => {
              removeRouteFromNavigationState(navigation, 'review-tx-routes', {
                maxDepth: 5,
              })
            }, 100)
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
          onErrorWithoutFeedback: (error) => {
            shouldResolve = false
            logger.error('useDappConnectorManager::handleSignTx', {error})
            reject(error)
          },
        })
      })
    },
    [
      activeTabOrigin,
      navigateToTxReview,
      dappCollateralRequestUtils,
      navigateToDiscoverBrowserDapp,
      dappList?.dapps,
      navigation,
    ],
  )

  const handleSignTxWithHW = React.useCallback(
    ({cbor, partial}: {cbor: string; partial?: boolean}) => {
      return new Promise<Transaction>((resolve, reject) => {
        let shouldResolve = true
        const dapps = dappList?.dapps || []
        const matchingDapp =
          activeTabOrigin != null
            ? dapps.find((dapp) => dapp.origins.includes(activeTabOrigin))
            : null
        navigateToTxReview({
          cbor,
          partial,
          preventSubmit: true,
          context: 'dapp',
          createdBy: matchingDapp != null && (
            <CreatedByInfoItem
              logo={matchingDapp.logo}
              url={matchingDapp.uri}
              name={matchingDapp.name}
            />
          ),
          onSuccessWithoutFeedback: (args) => {
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
            navigateToDiscoverBrowserDapp()
            // Remove review-tx-routes from navigation stack after navigating back to browser
            // Use setTimeout to ensure navigation completes before removing the route
            // Increase maxDepth to ensure we traverse up to WalletNavigator where review-tx-routes is located
            setTimeout(() => {
              removeRouteFromNavigationState(navigation, 'review-tx-routes', {
                maxDepth: 5,
              })
            }, 100)
          },
          onErrorWithoutFeedback: (error) => {
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
    },
    [
      activeTabOrigin,
      navigateToTxReview,
      navigateToDiscoverBrowserDapp,
      dappList?.dapps,
      navigation,
    ],
  )

  const handleSendReorganisationTx = React.useCallback(
    async ({manager, value}: {manager: DappConnector; value?: string}) => {
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

        // Track that this dapp requested collateral
        dappCollateralRequestUtils.addCollateralRequestedDappsId(
          matchingDappConnection.dappOrigin,
        )

        // Build the reorganisation transaction
        const cip30 = cip30ExtensionMaker(wallet, meta)
        cip30
          .buildReorganisationTx(value)
          .then((cbor) => {
            // Navigate to review screen for the collateral transaction
            navigateToTxReview({
              cbor,
              context: 'dapp',
              memo: strings.discover.collateralCreationTitle,
              createdBy: (
                <CreatedByInfoItem
                  logo={undefined}
                  url={activeTabUrl}
                  name={matchingDappConnection.dappOrigin}
                />
              ),
              details: {
                title: strings.manageCollateral.collateralInfoModalLabel,
                component: <CollateralInfoModal />,
              },
              generalNotice: <CollateralCreationNotice />,
              onSuccessWithoutFeedback: async (args) => {
                // Transaction was submitted successfully
                // Set collateral ID immediately to prevent duplicate reorganization transactions
                // The collateral UTXO will be at index 0 (first output of the reorganization transaction)
                const signedTx = args?.signedTx ?? args?.tx
                if (signedTx) {
                  try {
                    const txBytes = signedTx.toBytes()
                    const txId = await CardanoMobileWrapped.cslScope(
                      async (csl) => {
                        return await calculateTxId(
                          csl,
                          Buffer.from(txBytes).toString('hex'),
                          'hex',
                        )
                      },
                    )
                    // Set collateral ID to txId:0 (assuming collateral UTXO is at output index 0)
                    // This prevents duplicate reorganization transactions while waiting for confirmation
                    const collateralId = `${txId}:0`
                    wallet.setCollateralId(collateralId)
                    logger.info(
                      'useDappConnectorManager::handleSendReorganisationTx - collateral ID set',
                      {txId, collateralId},
                    )
                  } catch (error) {
                    logger.error(
                      'useDappConnectorManager::handleSendReorganisationTx - failed to set collateral ID',
                      {
                        error:
                          error instanceof Error
                            ? error.message
                            : String(error),
                      },
                    )
                    // Don't block the flow if setting collateral ID fails
                  }
                }
                resolve()
                navigateToDiscoverBrowserDapp()
                // Remove review-tx-routes from navigation stack
                setTimeout(() => {
                  removeRouteFromNavigationState(
                    navigation,
                    'review-tx-routes',
                    {
                      maxDepth: 5,
                    },
                  )
                }, 100)
              },
              onCancel: () => {
                reject(userRejectedError())
              },
              onClose: () => {
                reject(userRejectedError())
              },
              onErrorWithoutFeedback: (error) => {
                logger.error(
                  'useDappConnectorManager::handleSendReorganisationTx',
                  {
                    error,
                  },
                )
                reject(error)
              },
            })
          })
          .catch((error) => {
            logger.error(
              'useDappConnectorManager::handleSendReorganisationTx - failed to build transaction',
              {error},
            )
            reject(error)
          })
      })
    },
    [
      activeTabOrigin,
      activeTabUrl,
      dappCollateralRequestUtils,
      navigateToTxReview,
      navigateToDiscoverBrowserDapp,
      navigation,
      wallet,
      meta,
      strings,
    ],
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
        const title = strings.discover.signData
        const summary = `${strings.discover.signMessage}: ${Buffer.from(payload, 'hex').toString('utf-8')}`
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
    [promptRootKey, strings.discover.signData, strings.discover.signMessage],
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
    collateralTxPendingTitle: strings.discover.collateralTxPendingTitle,
    collateralNotFoundTitle: strings.discover.collateralNotFoundTitle,
    collateralTxPendingText: strings.discover.collateralTxPendingText,
    collateralNotFoundText: strings.discover.collateralNotFoundText,
    collateralNotFoundActionText: strings.discover.collateralNotFoundActionText,
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
      collateral.amount.quantity >= BigInt(collateralConfig.minLovelace)
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
