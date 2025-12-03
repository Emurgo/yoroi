// Main exports for @yoroi/wallet-manager package

// Core wallet manager factory
export {makeWalletManager, WALLET_MANAGER_VERSION, walletManager} from './wallet-manager'
export type {WalletManager} from './wallet-manager'

// Types
export * from './common/types'

// Hooks
export {useSelectedWallet} from './hooks/useSelectedWallet'
export {useSync} from './hooks/useSync'
export {useWallet} from './hooks/useWallet'
export {useWalletMetas} from './hooks/useWalletMetas'
export {useHasWallets} from './hooks/useHasWallets'
export {useCreateWalletMnemonic} from './hooks/useCreateWalletMnemonic'
export {useCreateWalletXPub} from './hooks/useCreateWalletXPub'
export {useCreateReadOnlyWalletFromAddresses} from './hooks/useCreateReadOnlyWalletFromAddresses'
export {useCreateWalletFromRootKey} from './hooks/useCreateWalletFromRootKey'
// useDisableEasyConfirmation removed - it imports from app and should be moved to app
export {useGenerateWalletLink} from './hooks/useGenerateWalletLink'
export {useLaunchWalletAfterSyncing} from './hooks/useLaunchWalletAfterSyncing'
export {usePlate} from './hooks/usePlate'
export {useReceiveAddresses} from './hooks/useReceiveAddresses'
export {useSelectedNetwork} from './hooks/useSelectedNetwork'
export {useBestBlock} from './hooks/useBestBlock'
export {useIsOnline} from './hooks/useIsOnline'
export {useSyncTemporarilyPaused} from './hooks/useSyncTemporarilyPaused'
export {useSyncWalletInfo} from './hooks/useSyncWalletInfo'
export {useUtxos} from './hooks/useUtxos'
export {useWalletEvent} from './hooks/useWalletEvent'
export {useAddressMode} from './hooks/useAddressMode'

// Context providers
export {
  WalletManagerProvider,
  useWalletManager,
  useWalletManagerSelector,
} from './context/WalletManagerProvider'
export {
  AutomaticWalletOpenerProvider,
  useAutomaticWalletOpener,
} from './context/AutomaticWalletOpeningProvider'
export {WalletManagerHydrationWrapper} from './context/WalletManagerHydrationWrapper'

// State
export * from './state/wallet-manager-state'

// Sync
export * from './sync/sync-manager'
export * from './sync/sync-strategies'
export * from './sync/sync-config'
export * from './sync/sync-state'
export * from './sync/backoff'

// Creation
export * from './creation/wallet-creation'

// Network manager
export * from './network-manager/get-wallet-factory'

// Lifecycle
export * from './lifecycle/wallet-lifecycle'

// Common
export * from './common/constants'
export * from './common/validators/wallet-meta'

// Mocks (for testing)
export {walletMocks} from './wallet.mock'

