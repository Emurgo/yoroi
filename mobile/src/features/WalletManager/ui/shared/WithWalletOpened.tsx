import {ClaimProvider, claimManagerMaker} from '@yoroi/claim'
import {
  ExchangeProvider,
  exchangeApiMaker,
  exchangeManagerMaker,
} from '@yoroi/exchange'
import {
  ResolverProvider,
  resolverApiMaker,
  resolverManagerMaker,
  resolverStorageMaker,
} from '@yoroi/resolver'
import {App, Resolver} from '@yoroi/types'

import * as React from 'react'

import {unstoppableApiKey} from '~/kernel/constants'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {useWalletManager} from '../../context/WalletManagerProvider'
import {useSelectedNetwork} from '../../hooks/useSelectedNetwork'
import {useSelectWalletModal} from '../modals/SelectWalletModal'

export const WithWalletOpened = ({children}: React.PropsWithChildren) => {
  const {
    selected: {wallet, meta},
  } = useWalletManager()
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
      <ClaimProvider manager={claimManager}>{children}</ClaimProvider>
    </NetworkWrapper>
  )
}

const NetworkWrapper = ({children}: React.PropsWithChildren) => {
  const {
    networkManager: {isMainnet},
  } = useSelectedNetwork()
  const resolverStorage = React.useMemo(() => {
    return resolverStorageMaker()
  }, [])

  const resolverApi = React.useMemo(() => {
    return resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: unstoppableApiKey,
        },
      },
      cslFactory: () => require('@emurgo/cross-csl-core'),
      isMainnet,
    })
  }, [isMainnet])

  const resolverManager = React.useMemo(() => {
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [resolverStorage, resolverApi])

  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      isProduction: isMainnet,
      partner: 'yoroi',
    })
    return exchangeManagerMaker({api})
  }, [isMainnet])

  return (
    <ResolverProvider resolverManager={resolverManager}>
      <ExchangeProvider
        manager={exchangeManager}
        initialState={initialExchangeState}
      >
        {children}
      </ExchangeProvider>
    </ResolverProvider>
  )
}

const initialExchangeState = {
  providerId: 'banxa',
  providerSuggestedByOrderType: {
    buy: 'banxa',
    sell: 'encryptus',
  },
}
