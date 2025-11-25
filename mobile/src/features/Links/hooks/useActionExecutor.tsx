import {useClaim, useClaimTokens} from '@yoroi/claim'
import {toBigInt} from '@yoroi/common'
import {linksCardanoModuleMaker} from '@yoroi/links'
import {PendingAction} from '@yoroi/links'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {useTransfer} from '@yoroi/transfer'
import {Links, Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as Linking from 'expo-linking'
import * as React from 'react'
import * as uuid from 'uuid'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useClaimErrorResolver} from '~/features/Claim/common/useClaimErrorResolver'
import {AskConfirmationModal} from '~/features/Claim/ui/modals/AskConfirmationModal'
import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useInfoModal} from '~/features/Scan/common/modals/InfoModal'
import {useTransactionNotFoundModal} from '~/features/Scan/common/modals/TransactionNotFoundModal'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {createDelegationTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {pastedFormatter} from '~/wallets/utils/amountUtils'

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
  const rootNavigation = useNavigation()
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
  const {openModal, closeModal, setLoading: startLoading} = useModal()
  const {addTabAndSetActive} = useBrowser()
  const walletNavigation = useWalletNavigation()
  const {openInfoModal} = useInfoModal()
  const {openTransactionNotFoundModal} = useTransactionNotFoundModal()
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const {
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    reset: resetTransferState,
    memoChanged,
    linkActionChanged,
  } = useTransfer()

  const {
    reset: resetClaimState,
    scanActionClaimChanged,
    address,
    claimInfoChanged,
  } = useClaim()

  const claimErrorResolver = useClaimErrorResolver()
  const {claimTokens} = useClaimTokens({
    onSuccess: (claimInfo) => {
      claimInfoChanged(claimInfo)
      closeModal()
      navigateTo.claimShowSuccess()
    },
    onError: (error) => {
      startLoading(false)
      const claimErrorDialog = claimErrorResolver(error)
      if (claimErrorDialog) {
        openInfoModal({
          title: claimErrorDialog.title,
          message: claimErrorDialog.message,
        })
      }
    },
  })

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

                if (params.memo) {
                  memoChanged(params.memo)
                }
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

                  const {
                    address: receiver,
                    amount,
                    memo,
                  } = parsedCardanoLink.params
                  const ptAmount = toBigInt(
                    amount,
                    wallet.portfolioPrimaryTokenInfo.decimals,
                  )
                  memoChanged(memo ?? '')
                  receiverResolveChanged(receiver ?? '')
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
            // Exchange order result
            try {
              ;(rootNavigation as any).navigate('manage-wallets', {
                screen: 'exchange-result',
              })
            } catch (error) {
              logger.error('Error navigating to exchange result', {error})
            }
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
        const scanAction = pendingAction.action

        switch (scanAction.action) {
          case 'launch-url': {
            Linking.openURL(scanAction.url)
            break
          }

          case 'send-single-pt': {
            resetTransferState()
            receiverResolveChanged(scanAction.receiver)

            if (scanAction.params) {
              if ('amount' in scanAction.params) {
                tokenSelectedChanged(defaultPrimaryTokenInfo.id)
                amountChanged({
                  info: defaultPrimaryTokenInfo,
                  quantity: toBigInt(
                    pastedFormatter(
                      scanAction.params?.amount?.toString() ?? '',
                    ),
                    defaultPrimaryTokenInfo.decimals,
                  ),
                })
              }
              if ('memo' in scanAction.params)
                memoChanged(scanAction.params?.memo ?? '')
            }

            navigateTo.startTransfer()
            break
          }

          case 'send-only-receiver': {
            resetTransferState()
            receiverResolveChanged(scanAction.receiver)
            navigateTo.startTransfer()
            break
          }

          case 'claim': {
            navigateTo.back()
            resetClaimState()
            scanActionClaimChanged(scanAction)

            const handleOnContinue = () => {
              startLoading(true)
              claimTokens(scanAction)
            }

            timeoutRef.current = setTimeout(() => {
              openModal({
                title: strings.claim.askConfirmationTitle,
                content: (
                  <AskConfirmationModal.Content
                    address={address}
                    url={scanAction.url}
                    code={scanAction.code}
                  />
                ),
                footer: (
                  <AskConfirmationModal.Footer onContinue={handleOnContinue} />
                ),
                height: 400,
              })
            }, 300)
            break
          }

          case 'browse-dapp': {
            // CIP-158: Launch dApp in browser
            const id = uuid.v4()
            addTabAndSetActive(scanAction.url, id)
            walletNavigation.navigateToDiscoverBrowserDapp()
            break
          }

          case 'pay-request': {
            // CIP-PR843 or CIP-13: Payment request
            resetTransferState()
            receiverResolveChanged(scanAction.address)

            if (scanAction.amount) {
              tokenSelectedChanged(defaultPrimaryTokenInfo.id)
              amountChanged({
                info: defaultPrimaryTokenInfo,
                quantity: toBigInt(
                  pastedFormatter(scanAction.amount),
                  defaultPrimaryTokenInfo.decimals,
                ),
              })
            }
            if (scanAction.memo) {
              memoChanged(scanAction.memo)
            }

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
                message: `Pool ID: ${scanAction.pool}`,
              })
              break
            }

            const {wallet: selectedWallet, meta} = selectedWalletData

            const createDelegationTx = async () => {
              try {
                logger.debug(
                  'useActionExecutor: creating delegation transaction',
                  {
                    poolId: scanAction.pool,
                  },
                )

                const stakingTx = await createDelegationTxFromWallet(
                  selectedWallet,
                  {
                    poolId: scanAction.pool,
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
                    poolId: scanAction.pool,
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

          case 'view-transaction': {
            // CIP-107: View transaction details
            if (wallet) {
              const transactions = wallet.transactions
              const transaction = transactions
                ? Object.values(transactions).find(
                    (tx) => tx.id === scanAction.hash,
                  )
                : undefined
              if (transaction) {
                walletNavigation.navigateToTxDetails(transaction.id)
              } else {
                const explorers = wallet.networkManager?.explorers
                if (explorers?.cardanoscan) {
                  openTransactionNotFoundModal({
                    hash: scanAction.hash,
                    explorerUrl: explorers.cardanoscan.tx(scanAction.hash),
                  })
                }
              }
            } else {
              walletNavigation.navigateToTxDetails(scanAction.hash)
            }
            break
          }

          case 'view-block': {
            // CIP-107: View block details
            walletNavigation.navigateToBlockDetails({
              hash: scanAction.hash,
              height: scanAction.height,
            })
            break
          }

          case 'view-address': {
            // CIP-134: View address details
            walletNavigation.navigateToAddressDetails(scanAction.address)
            break
          }

          case 'p2p-connect': {
            // P2P connection
            walletNavigation.navigateToP2PConnection({
              peerId: scanAction.peerId,
              signalingUrl: scanAction.signalingUrl,
            })
            break
          }

          case 'restore-wallet': {
            // Wallet restoration - works without selected wallet
            // Sanitize sensitive data before logging
            const sanitizedAction = {
              action: scanAction.action,
              type: scanAction.type,
              encryption: scanAction.encryption,
              name: scanAction.name,
              implementation: scanAction.implementation,
              addressMode: scanAction.addressMode,
              accountVisual: scanAction.accountVisual,
              hasMnemonic: !!scanAction.mnemonic,
              hasRootKey: !!scanAction.rootKey,
              hasAccountPubKey: !!scanAction.accountPubKey,
            }
            logger.info('useActionExecutor: restore-wallet action', {
              isLoggedIn,
              scanAction: sanitizedAction,
            })

            if (isLoggedIn) {
              walletNavigation.navigateToRestoreWalletFromLink(scanAction)
            } else {
              try {
                ;(rootNavigation as any).navigate('setup-wallet', {
                  screen: 'setup-wallet-restore-from-link',
                  params: {action: scanAction},
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
                `useActionExecutor: unknown Cardano action: ${(scanAction as {action: string}).action}`,
              ),
            )
            break
        }
      }
    },
    [
      isLoggedIn,
      wallet,
      selectedWalletData,
      defaultPrimaryTokenInfo,
      openModal,
      closeModal,
      startLoading,
      addTabAndSetActive,
      walletNavigation,
      openInfoModal,
      openTransactionNotFoundModal,
      navigateTo,
      strings,
      resetTransferState,
      receiverResolveChanged,
      amountChanged,
      tokenSelectedChanged,
      memoChanged,
      linkActionChanged,
      resetClaimState,
      scanActionClaimChanged,
      address,
      claimTokens,
      rootNavigation,
    ],
  )

  return executeAction
}
