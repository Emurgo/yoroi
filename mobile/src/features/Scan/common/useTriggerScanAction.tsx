import {useClaim, useClaimTokens} from '@yoroi/claim'
import {toBigInt} from '@yoroi/common'
import {useTransfer} from '@yoroi/transfer'
import {Scan} from '@yoroi/types'

import * as Linking from 'expo-linking'
import * as React from 'react'
import * as uuid from 'uuid'

import {useClaimErrorResolver} from '~/features/Claim/common/useClaimErrorResolver'
import {AskConfirmationModal} from '~/features/Claim/ui/modals/AskConfirmationModal'
import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {pastedFormatter} from '~/wallets/utils/amountUtils'

import {useInfoModal} from './modals/InfoModal'
import {useTransactionNotFoundModal} from './modals/TransactionNotFoundModal'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({
  insideFeature,
}: {
  insideFeature: Scan.Feature
}) => {
  const {
    wallet: {portfolioPrimaryTokenInfo},
    wallet,
  } = useSelectedWallet()
  const {openModal, closeModal, setLoading: startLoading} = useModal()
  const {addTabAndSetActive} = useBrowser()
  const walletNavigation = useWalletNavigation()
  const {openInfoModal} = useInfoModal()
  const {openTransactionNotFoundModal} = useTransactionNotFoundModal()

  const navigateTo = useNavigateTo()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

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

  const trigger = (scanAction: Scan.Action) => {
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
            tokenSelectedChanged(portfolioPrimaryTokenInfo.id)
            amountChanged({
              info: portfolioPrimaryTokenInfo,
              quantity: toBigInt(
                pastedFormatter(scanAction.params?.amount?.toString() ?? ''),
                portfolioPrimaryTokenInfo.decimals,
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
          tokenSelectedChanged(portfolioPrimaryTokenInfo.id)
          amountChanged({
            info: portfolioPrimaryTokenInfo,
            quantity: toBigInt(
              pastedFormatter(scanAction.amount),
              portfolioPrimaryTokenInfo.decimals,
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
        // CIP-13: Navigate to staking center with pool
        walletNavigation.navigateToStakingDashboard()
        // TODO: Pass pool ID to staking center when UI supports it
        openInfoModal({
          title: strings.scan.stakePoolTitle,
          message: `Pool ID: ${scanAction.pool}`,
        })
        break
      }

      case 'view-transaction': {
        // CIP-107: View transaction details
        // Find transaction by hash (transaction.id is the hash)
        const transaction = Object.values(wallet.transactions).find(
          (tx) => tx.id === scanAction.hash,
        )
        if (transaction) {
          walletNavigation.navigateToTxDetails(transaction.id)
        } else {
          // Transaction not found in wallet history, show explorer link
          const explorers = wallet.networkManager.explorers
          openTransactionNotFoundModal({
            hash: scanAction.hash,
            explorerUrl: explorers.cardanoscan.tx(scanAction.hash),
          })
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
        walletNavigation.navigateToRestoreWalletFromLink(scanAction)
        break
      }
    }
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return trigger
}
