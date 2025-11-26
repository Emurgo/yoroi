import {ClaimProvider, claimManagerMaker} from '@yoroi/claim'
import {
  ExchangeProvider,
  exchangeApiMaker,
  exchangeManagerMaker,
} from '@yoroi/exchange'
import {App} from '@yoroi/types'

import * as React from 'react'

import {P2PConnectionProviderWrapper} from '~/features/P2P/components/P2PConnectionProviderWrapper'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {useWalletManagerSelector} from '../../context/WalletManagerProvider'
import {useSelectedNetwork} from '../../hooks/useSelectedNetwork'
import {useSelectWalletModal} from '../modals/SelectWalletModal'

export const WithWalletOpened = ({children}: React.PropsWithChildren) => {
  // Use selector to prevent re-renders when network changes
  const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)
  const meta = useWalletManagerSelector((ctx) => ctx.selected.meta)
  const {openSelectWalletModal} = useSelectWalletModal()
  const walletNavigation = useWalletNavigation()
  const [hasShownModal, setHasShownModal] = React.useState(false)

  // Show modal if wallet is not selected (only once per mount)
  React.useEffect(() => {
    if (!wallet || !meta) {
      if (!hasShownModal) {
        setHasShownModal(true)
        openSelectWalletModal({
          onSelect: () => {
            setHasShownModal(false)
          },
          onCancel: () => {
            setHasShownModal(false)
            walletNavigation.resetToWalletSelection()
          },
        })
      }
    } else {
      setHasShownModal(false)
    }
  }, [wallet, meta, hasShownModal, openSelectWalletModal, walletNavigation])

  // Must call hooks before early return (React rules)
  const claimManager = React.useMemo(() => {
    if (!wallet || !meta) {
      // Return a placeholder - won't be used since we return null below
      return null
    }
    const address = wallet.externalAddresses[0]
    if (!address) throw new App.Errors.InvalidState('Missing external address')

    return claimManagerMaker({
      address,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      tokenManager: wallet.networkManager.tokenManager,
    })
  }, [wallet, meta])

  // Don't render children until wallet is selected
  // The modal is shown and non-dismissible, so user must select a wallet
  if (!wallet || !meta || !claimManager) {
    return null
  }

  // From this point, wallet and meta are guaranteed to be non-null
  // Children can safely use useSelectedWallet() without null checks

  return (
    <NetworkWrapper>
      <ClaimProvider manager={claimManager}>
        <P2PConnectionProviderWrapper>{children}</P2PConnectionProviderWrapper>
      </ClaimProvider>
    </NetworkWrapper>
  )
}

const NetworkWrapper = ({children}: React.PropsWithChildren) => {
  const {
    networkManager: {isMainnet},
  } = useSelectedNetwork()

  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      isProduction: isMainnet,
      partner: 'yoroi',
    })
    return exchangeManagerMaker({api})
  }, [isMainnet])

  return (
    <ExchangeProvider
      manager={exchangeManager}
      initialState={initialExchangeState}
    >
      {children}
    </ExchangeProvider>
  )
}

const initialExchangeState = {
  providerId: 'banxa',
  providerSuggestedByOrderType: {
    buy: 'banxa',
    sell: 'encryptus',
  },
}
