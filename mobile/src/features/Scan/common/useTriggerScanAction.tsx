import {useClaim, useClaimTokens} from '@yoroi/claim'
import {toBigInt} from '@yoroi/common'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio, Scan} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as Linking from 'expo-linking'
import * as React from 'react'
import * as uuid from 'uuid'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useClaimErrorResolver} from '~/features/Claim/common/useClaimErrorResolver'
import {AskConfirmationModal} from '~/features/Claim/ui/modals/AskConfirmationModal'
import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {createDelegationTxFromWallet} from '~/wallets/cardano/transaction-recipes'
import {pastedFormatter} from '~/wallets/utils/amountUtils'

import {useInfoModal} from './modals/InfoModal'
import {useTransactionNotFoundModal} from './modals/TransactionNotFoundModal'
import {useNavigateTo} from './useNavigateTo'

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

export const useTriggerScanAction = ({
  insideFeature,
}: {
  insideFeature: Scan.Feature
}) => {
  // Use selector to only re-render when wallet changes, not when network changes
  const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
  const {isLoggedIn} = useAuth()
  const rootNavigation = useNavigation()
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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  // Get selected wallet and meta for delegation transactions
  const meta = useWalletManagerSelector((ctx) => ctx.selected.meta)
  const selectedWalletData = wallet && meta ? {wallet, meta} : null
  const {
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    reset: resetTransferState,
    memoChanged,
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
  const strings = useStrings()

  // Cleanup effect
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const trigger = (scanAction: Scan.Action) => {
    logger.info('useTriggerScanAction: trigger called', {
      action: scanAction.action,
      scanAction,
      isLoggedIn,
    })

    switch (scanAction.action) {
      case 'launch-url': {
        Linking.openURL(scanAction.url)
        break
      }

      case 'send-single-pt': {
        if (insideFeature !== 'send') resetTransferState()

        receiverResolveChanged(scanAction.receiver)

        if (scanAction.params) {
          if ('amount' in scanAction.params) {
            tokenSelectedChanged(defaultPrimaryTokenInfo.id)
            amountChanged({
              info: defaultPrimaryTokenInfo,
              quantity: toBigInt(
                pastedFormatter(scanAction.params?.amount?.toString() ?? ''),
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
        if (insideFeature !== 'send') resetTransferState()

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
        if (!isLoggedIn) return
        const id = uuid.v4()
        addTabAndSetActive(scanAction.url, id)
        walletNavigation.navigateToDiscoverBrowserDapp()
        break
      }

      case 'pay-request': {
        // CIP-PR843 or CIP-13: Payment request
        if (insideFeature !== 'send') resetTransferState()

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
        // CIP-13: Create delegation transaction and navigate to review
        if (!wallet || !selectedWalletData) {
          logger.warn('useTriggerScanAction: stake-pool action requires wallet')
          openInfoModal({
            title: strings.scan.stakePoolTitle,
            message: `Pool ID: ${scanAction.pool}`,
          })
          break
        }

        const {wallet: selectedWallet, meta} = selectedWalletData

        // Create delegation transaction asynchronously
        const createDelegationTx = async () => {
          try {
            logger.debug(
              'useTriggerScanAction: creating delegation transaction',
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
              'useTriggerScanAction: error creating delegation transaction',
              {
                error: err,
                poolId: scanAction.pool,
              },
            )

            // Check if error is due to insufficient balance
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
        // This action requires a wallet, so navigate to wallet selection if needed
        // The target screen (wrapped in WithWalletOpened) will handle wallet selection
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
            // Transaction not found in wallet history, show explorer link
            const explorers = wallet.networkManager?.explorers
            if (explorers?.cardanoscan) {
              openTransactionNotFoundModal({
                hash: scanAction.hash,
                explorerUrl: explorers.cardanoscan.tx(scanAction.hash),
              })
            }
          }
        } else {
          // No wallet selected - navigate to wallet selection
          // The target screen will be wrapped in WithWalletOpened and handle wallet selection
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
        // P2P connection: Navigate to P2P connection screen
        walletNavigation.navigateToP2PConnection({
          peerId: scanAction.peerId,
          signalingUrl: scanAction.signalingUrl,
        })
        break
      }

      case 'restore-wallet': {
        // Wallet restoration: Navigate to restore wallet from link screen
        // When not logged in, navigate directly to setup-wallet screen
        // When logged in, use walletNavigation which navigates through manage-wallets
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
        logger.info('useTriggerScanAction: restore-wallet action', {
          isLoggedIn,
          scanAction: sanitizedAction,
        })

        if (isLoggedIn) {
          logger.info(
            'useTriggerScanAction: navigating via walletNavigation (logged in)',
            {
              scanAction: sanitizedAction,
            },
          )
          walletNavigation.navigateToRestoreWalletFromLink(scanAction)
        } else {
          logger.info(
            'useTriggerScanAction: navigating directly to setup-wallet (not logged in)',
            {
              scanAction: sanitizedAction,
            },
          )
          // Navigate directly to setup-wallet screen when not logged in
          try {
            ;(rootNavigation as any).navigate('setup-wallet', {
              screen: 'setup-wallet-restore-from-link',
              params: {action: scanAction},
            })
            logger.info(
              'useTriggerScanAction: navigation to setup-wallet completed',
            )
          } catch (error) {
            logger.info('useTriggerScanAction: navigation error', {
              error,
              errorMessage:
                error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
            })
          }
        }
        break
      }
    }
  }

  return trigger
}
