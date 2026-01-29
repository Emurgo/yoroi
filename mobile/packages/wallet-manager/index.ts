// Main exports for @yoroi/wallet-manager package

// Core wallet manager factory
export {makeWalletManager, WALLET_MANAGER_VERSION} from './wallet-manager'
export type {WalletManager} from './wallet-manager'

// Types
export * from './common/types'

// Hooks
export {useCreateReadOnlyWalletFromAddresses} from './hooks/useCreateReadOnlyWalletFromAddresses'
export {useCreateWalletFromRootKey} from './hooks/useCreateWalletFromRootKey'
export {useCreateWalletMnemonic} from './hooks/useCreateWalletMnemonic'
export {useCreateWalletXPub} from './hooks/useCreateWalletXPub'
export {useHasWallets} from './hooks/useHasWallets'
export {useSelectedWallet} from './hooks/useSelectedWallet'
export {useSync} from './hooks/useSync'
export {useWallet} from './hooks/useWallet'
export {useWalletMetas} from './hooks/useWalletMetas'
// useDisableEasyConfirmation removed - it imports from app and should be moved to app
export {useAddressMode} from './hooks/useAddressMode'
export {useBestBlock} from './hooks/useBestBlock'
export {useCollateralInfo} from './hooks/useCollateralInfo'
export {useGenerateWalletLink} from './hooks/useGenerateWalletLink'
export {useIsOnline} from './hooks/useIsOnline'
export {useLaunchWalletAfterSyncing} from './hooks/useLaunchWalletAfterSyncing'
export {usePlate} from './hooks/usePlate'
export {useReceiveAddresses} from './hooks/useReceiveAddresses'
export {useSelectedNetwork} from './hooks/useSelectedNetwork'
export {useSyncTemporarilyPaused} from './hooks/useSyncTemporarilyPaused'
export {useSyncWalletInfo} from './hooks/useSyncWalletInfo'
export {useUtxos} from './hooks/useUtxos'
export {useWalletEvent} from './hooks/useWalletEvent'

// Context providers
export {
  AutomaticWalletOpenerProvider,
  useAutomaticWalletOpener,
} from './context/AutomaticWalletOpeningProvider'
export {WalletManagerHydrationWrapper} from './context/WalletManagerHydrationWrapper'
export {
  useWalletManager,
  useWalletManagerSelector,
  WalletManagerProvider,
} from './context/WalletManagerProvider'

// State
export * from './state/wallet-manager-state'

// Sync
export * from './sync/backoff'
export * from './sync/sync-config'
export * from './sync/sync-manager'
export * from './sync/sync-state'
export * from './sync/sync-strategies'

// Creation
export * from './creation/wallet-creation'

// Network manager
export * from './network-manager/get-wallet-factory'

// Lifecycle
export * from './lifecycle/wallet-lifecycle'

// Recovery
export {recoverOrphanedWallets} from './recovery/recover-orphaned-wallets'

// Common
export * from './common/constants'
export * from './common/validators/wallet-meta'

// Mocks (for testing)
// Note: wallet.mock.ts is excluded from package build but exported for test/mock usage
export {walletMocks} from './wallet.mock'
