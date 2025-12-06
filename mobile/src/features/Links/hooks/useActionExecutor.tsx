import {createDelegationTxFromWallet} from '@yoroi/cardano-wallet'
import {pastedFormatter} from '@yoroi/cardano-wallet'
import {toBigInt} from '@yoroi/common'
import {PendingAction, linksCardanoModuleMaker} from '@yoroi/links'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {useTransfer} from '@yoroi/transfer'
import {Links, Portfolio} from '@yoroi/types'
import {useHasWallets} from '@yoroi/wallet-manager'
import {useWalletManagerSelector} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as Linking from 'expo-linking'
import * as React from 'react'
import * as uuid from 'uuid'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {ExchangeResultModal} from '~/features/Exchange/useCases/ShowExchangeResultOrderScreen/ExchangeResultModal'
import {useInfoModal} from '~/features/Scan/common/modals/InfoModal'
import {useTransactionNotFoundModal} from '~/features/Scan/common/modals/TransactionNotFoundModal'
import {useNavigateTo as useGovernanceNavigateTo} from '~/features/Staking/Governance/common/navigation'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {AppRouteNavigation} from '~/kernel/navigation/types'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {RequestedAdaPaymentWithLinkModal} from '../ui/modals/RequestedAdaPaymentWithLinkModal'
import {RequestedBrowserLaunchDappUrlModal} from '../ui/modals/RequestedBrowserLaunchDappUrlModal'
import {useNavigateTo} from './useNavigationTo'

// Create a minimal primary token info for Cardano (ADA always has 6 decimals)
const getDefaultPrimaryTokenInfo = (): Portfolio.Token.Info =>
  createPrimaryTokenInfo({
    decimals: 6,
    name: 'ADA',
    ticker: 'ADA',
    symbol: '₳',
    reference: '',
    tag: '',
    website: 'https://www.cardano.org/',
    originalImage: '',
    description: 'Cardano',
  })

const heightBreakpoint = 467

export const useActionExecutor = () => {
  const {isLoggedIn} = useAuth()
  const hasWallets = useHasWallets()
  const rootNavigation = useNavigation<AppRouteNavigation>()
  const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
  const meta = useWalletManagerSelector((ctx) => ctx.selected.meta)
  const selectedWalletData = React.useMemo(
    () => (wallet && meta ? {wallet, meta} : null),
    [wallet, meta],
  )
  const defaultPrimaryTokenInfo = React.useMemo(
    () => getDefaultPrimaryTokenInfo(),
    [],
  )
  const {openModal, closeModal} = useModal()
  const {addTabAndSetActive} = useBrowser()
  const walletNavigation = useWalletNavigation()
  const {openInfoModal} = useInfoModal()
  const {openTransactionNotFoundModal} = useTransactionNotFoundModal()
  const navigateTo = useNavigateTo()
  const navigateToGovernance = useGovernanceNavigateTo()
  const strings = useStrings()
  const {
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    reset: resetTransferState,
    linkActionChanged,
  } = useTransfer()

  const executeAction = React.useCallback(
    (pendingAction: PendingAction) => {
      logger.info('useActionExecutor: executing action', {
        source: pendingAction.source,
        actionType:
          pendingAction.source === 'yoroi'
            ? pendingAction.action.info.useCase
            : pendingAction.action.action,
        isLoggedIn,
      })

      if (pendingAction.source === 'yoroi') {
        const yoroiAction = pendingAction.action

        switch (yoroiAction.info.useCase) {
          case 'request/ada': {
            // Direct transfer request with params
            if (!wallet) return
            resetTransferState()
            try {
              const params = yoroiAction.info
                .params as Links.TransferRequestAdaParams
              const redirectTo = params.redirectTo
              if (redirectTo != null) linkActionChanged(yoroiAction)

              const target = params.targets[0]
              if (target) {
                receiverResolveChanged(target.receiver)

                const amount = target.amounts[0]
                if (amount && amount.tokenId === '.') {
                  tokenSelectedChanged(wallet.portfolioPrimaryTokenInfo.id)
                  amountChanged({
                    quantity: BigInt(amount.quantity),
                    info: wallet.portfolioPrimaryTokenInfo,
                  })
                }

                // Memo is now handled in ReviewTx, not in transfer state
              }

              closeModal()
              navigateTo.startTransfer()
            } catch (error) {
              logger.error('Error processing transfer request', {error})
              closeModal()
            }
            break
          }

          case 'request/ada-with-link': {
            // Transfer request with Cardano link
            if (!wallet) return
            const params = yoroiAction.info
              .params as Links.TransferRequestAdaWithLinkParams
            const title = yoroiAction.isTrusted
              ? strings.links.trustedPaymentRequestedTitle
              : strings.links.untrustedPaymentRequestedTitle

            const handleOnContinue = () => {
              resetTransferState()
              try {
                const link = decodeURIComponent(params.link)
                const parsedCardanoLink = linksCardanoModuleMaker().parse(link)
                if (parsedCardanoLink) {
                  const redirectTo = params.redirectTo
                  if (redirectTo != null) linkActionChanged(yoroiAction)

                  const {address: receiver, amount} = parsedCardanoLink.params
                  const ptAmount = toBigInt(
                    typeof amount === 'string' || typeof amount === 'number'
                      ? amount
                      : String(amount ?? '0'),
                    wallet.portfolioPrimaryTokenInfo.decimals,
                  )
                  // Memo is now handled in ReviewTx, not in transfer state
                  receiverResolveChanged(
                    typeof receiver === 'string' ? receiver : '',
                  )
                  amountChanged({
                    quantity: ptAmount,
                    info: wallet.portfolioPrimaryTokenInfo,
                  })
                  closeModal()
                  navigateTo.startTransfer()
                }
              } catch (error) {
                closeModal()
                logger.error('Error parsing Cardano link', {error})
              }
            }

            openModal({
              title: title,
              content: (
                <RequestedAdaPaymentWithLinkModal.Content
                  params={params}
                  isTrusted={yoroiAction.isTrusted}
                />
              ),
              footer: (
                <RequestedAdaPaymentWithLinkModal.Footer
                  onContinue={handleOnContinue}
                />
              ),
              height: heightBreakpoint,
            })
            break
          }

          case 'launch': {
            // Browser launch dApp URL (normalized to browse-dapp)
            const params = yoroiAction.info
              .params as Links.BrowserLaunchDappUrlParams
            const title = yoroiAction.isTrusted
              ? strings.links.trustedBrowserLaunchDappUrlTitle
              : strings.links.untrustedBrowserLaunchDappUrlTitle

            const handleOnContinue = () => {
              try {
                const dappUrl = decodeURIComponent(params.dappUrl)
                const redirectTo = params.redirectTo
                if (redirectTo != null) linkActionChanged(yoroiAction)

                const id = uuid.v4()
                addTabAndSetActive(dappUrl, id)
                closeModal()
                walletNavigation.navigateToDiscoverBrowserDapp()
                // Action will be cleared by modal footer on continue
              } catch (error) {
                closeModal()
                logger.error('Error parsing Yoroi link', {error})
              }
            }

            openModal({
              title: title,
              content: (
                <RequestedBrowserLaunchDappUrlModal.Content
                  params={params}
                  isTrusted={yoroiAction.isTrusted}
                />
              ),
              footer: (
                <RequestedBrowserLaunchDappUrlModal.Footer
                  onContinue={handleOnContinue}
                />
              ),
              height: heightBreakpoint,
            })
            break
          }

          case 'order/show-create-result': {
            // Exchange order result - show as modal, doesn't require wallet
            openModal({
              title: strings.exchange.title,
              content: <ExchangeResultModal />,
              full: true,
            })
            break
          }

          default:
            logger.error(
              new Error(
                `useActionExecutor: unknown Yoroi useCase: ${(yoroiAction.info as {useCase: string}).useCase}`,
              ),
            )
            break
        }
      } else {
        // Cardano action
        const cardanoAction = pendingAction.action

        switch (cardanoAction.action) {
          case 'launch-url': {
            Linking.openURL(cardanoAction.url)
            break
          }

          case 'send-single-pt': {
            resetTransferState()
            receiverResolveChanged(cardanoAction.receiver)

            if (cardanoAction.params) {
              if ('amount' in cardanoAction.params) {
                tokenSelectedChanged(defaultPrimaryTokenInfo.id)
                amountChanged({
                  info: defaultPrimaryTokenInfo,
                  quantity: toBigInt(
                    pastedFormatter(
                      cardanoAction.params?.amount?.toString() ?? '',
                    ),
                    defaultPrimaryTokenInfo.decimals,
                  ),
                })
              }
              // Memo is now handled in ReviewTx, not in transfer state
            }

            navigateTo.startTransfer()
            break
          }

          case 'send-only-receiver': {
            resetTransferState()
            receiverResolveChanged(cardanoAction.receiver)
            navigateTo.startTransfer()
            break
          }

          case 'claim': {
            // Navigate to dedicated claim screen
            // ClaimActionHandler in that screen will process the action
            // claim is nested: manage-wallets -> main-wallet-routes -> history -> claim
            rootNavigation.navigate('manage-wallets', {
              screen: 'main-wallet-routes',
              params: {
                screen: 'history',
                params: {
                  screen: 'claim',
                },
              },
            })
            break
          }

          case 'browse-dapp': {
            // CIP-158: Launch dApp in browser
            const id = uuid.v4()
            addTabAndSetActive(cardanoAction.url, id)
            walletNavigation.navigateToDiscoverBrowserDapp()
            break
          }

          case 'pay-request': {
            // CIP-PR843 or CIP-13: Payment request
            resetTransferState()
            receiverResolveChanged(cardanoAction.address)

            if (cardanoAction.amount) {
              tokenSelectedChanged(defaultPrimaryTokenInfo.id)
              amountChanged({
                info: defaultPrimaryTokenInfo,
                quantity: toBigInt(
                  pastedFormatter(cardanoAction.amount),
                  defaultPrimaryTokenInfo.decimals,
                ),
              })
            }
            // Memo is now handled in ReviewTx, not in transfer state

            navigateTo.startTransfer()
            break
          }

          case 'stake-pool': {
            // CIP-13: Create delegation transaction
            if (!wallet || !selectedWalletData) {
              logger.warn(
                'useActionExecutor: stake-pool action requires wallet',
              )
              openInfoModal({
                title: strings.scan.stakePoolTitle,
                message: `Pool ID: ${cardanoAction.pool}`,
              })
              break
            }

            const {wallet: selectedWallet, meta} = selectedWalletData

            const createDelegationTx = async () => {
              try {
                logger.debug(
                  'useActionExecutor: creating delegation transaction',
                  {
                    poolId: cardanoAction.pool,
                  },
                )

                const stakingTx = await createDelegationTxFromWallet(
                  selectedWallet,
                  {
                    poolId: cardanoAction.pool,
                    addressMode: meta.addressMode,
                  },
                )

                walletNavigation.navigateToTxReview({
                  cbor: stakingTx.cbor,
                  context: 'delegate',
                })
              } catch (error) {
                const err =
                  error instanceof Error ? error : new Error(String(error))
                logger.error(
                  'useActionExecutor: error creating delegation transaction',
                  {
                    error: err,
                    poolId: cardanoAction.pool,
                  },
                )

                if (isInsufficientBalanceError(error)) {
                  openInfoModal({
                    title: strings.scan.stakePoolTitle,
                    message: strings.staking.noFunds,
                  })
                } else {
                  openInfoModal({
                    title: strings.scan.stakePoolTitle,
                    message: err.message,
                  })
                }
              }
            }

            createDelegationTx()
            break
          }

          case 'delegate-drep': {
            // DRep delegation: Navigate to governance home screen to handle transaction building
            logger.debug(
              'useActionExecutor: navigating to governance for DRep delegation',
              {
                drepId: cardanoAction.drep,
              },
            )

            // Navigate to home screen with DRep ID as param
            // Home screen handles both users who have voted and those who haven't
            // It will automatically open the DRep input modal with prefilled DRep ID
            navigateToGovernance.home({drepId: cardanoAction.drep})
            break
          }

          case 'view-transaction': {
            // CIP-107: View transaction details
            if (wallet) {
              const transaction = wallet.getRawTransaction(cardanoAction.hash)
              if (transaction) {
                walletNavigation.navigateToTxDetails(transaction.id)
              } else {
                const explorers = wallet.networkManager?.explorers
                if (explorers?.cardanoscan) {
                  openTransactionNotFoundModal({
                    hash: cardanoAction.hash,
                    explorerUrl: explorers.cardanoscan.tx(cardanoAction.hash),
                  })
                }
              }
            } else {
              walletNavigation.navigateToTxDetails(cardanoAction.hash)
            }
            break
          }

          case 'view-block': {
            // CIP-107: View block details
            walletNavigation.navigateToBlockDetails({
              hash: cardanoAction.hash,
              height: cardanoAction.height,
            })
            break
          }

          case 'view-address': {
            // CIP-134: View address details
            walletNavigation.navigateToAddressDetails(cardanoAction.address)
            break
          }

          case 'p2p-connect': {
            // P2P connection
            walletNavigation.navigateToP2PConnection({
              dappPeer: cardanoAction.dappPeer,
              host: cardanoAction.host,
              port: cardanoAction.port,
              path: cardanoAction.path,
              secure: cardanoAction.secure,
            })
            break
          }

          case 'restore-wallet': {
            // Wallet restoration - works without selected wallet
            // Sanitize sensitive data before logging
            const sanitizedAction = {
              action: cardanoAction.action,
              type: cardanoAction.type,
              encryption: cardanoAction.encryption,
              name: cardanoAction.name,
              implementation: cardanoAction.implementation,
              addressMode: cardanoAction.addressMode,
              accountVisual: cardanoAction.accountVisual,
              hasMnemonic: !!cardanoAction.mnemonic,
              hasRootKey: !!cardanoAction.rootKey,
              hasAccountPubKey: !!cardanoAction.accountPubKey,
            }
            logger.info('useActionExecutor: restore-wallet action', {
              isLoggedIn,
              hasWallets,
              cardanoAction: sanitizedAction,
            })

            if (isLoggedIn) {
              // When logged in but no wallets exist, navigate directly to setup-wallet
              // because manage-wallets is not in the navigation stack yet
              if (!hasWallets) {
                try {
                  rootNavigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'setup-wallet',
                        state: {
                          routes: [
                            {
                              name: 'setup-wallet-restore-from-link',
                              params: {action: cardanoAction},
                            },
                          ],
                        },
                      },
                    ],
                  })
                } catch (error) {
                  logger.error(
                    'useActionExecutor: navigation error when logged in without wallets',
                    {
                      error,
                      errorMessage:
                        error instanceof Error ? error.message : String(error),
                    },
                  )
                }
              } else {
                // When wallets exist, use the standard navigation through manage-wallets
                walletNavigation.navigateToRestoreWalletFromLink(cardanoAction)
              }
            } else {
              try {
                // Use reset to ensure clean navigation state when not logged in
                // This prevents issues if user is already in setup-wallet flow
                rootNavigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'setup-wallet',
                      state: {
                        routes: [
                          {
                            name: 'setup-wallet-restore-from-link',
                            params: {action: cardanoAction},
                          },
                        ],
                      },
                    },
                  ],
                })
              } catch (error) {
                logger.info('useActionExecutor: navigation error', {
                  error,
                  errorMessage:
                    error instanceof Error ? error.message : String(error),
                })
              }
            }
            break
          }

          default:
            logger.error(
              new Error(
                `useActionExecutor: unknown Cardano action: ${(cardanoAction as {action: string}).action}`,
              ),
            )
            break
        }
      }
    },
    [
      isLoggedIn,
      hasWallets,
      wallet,
      selectedWalletData,
      defaultPrimaryTokenInfo,
      openModal,
      closeModal,
      addTabAndSetActive,
      walletNavigation,
      openInfoModal,
      openTransactionNotFoundModal,
      navigateTo,
      navigateToGovernance,
      strings,
      resetTransferState,
      receiverResolveChanged,
      amountChanged,
      tokenSelectedChanged,
      linkActionChanged,
      rootNavigation,
    ],
  )

  return executeAction
}
