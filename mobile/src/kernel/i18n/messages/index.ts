export {authMessages} from './auth'
export {claimMessages} from './claim'
export {dashboardMessages} from './dashboard'
export {discoverMessages} from './discover'
export {exchangeMessages} from './exchange'
export {hardwareWalletMessages} from './hardware-wallet'
export {initializationMessages} from './initialization'
export {ledgerMessages} from './ledger'
export {linksMessages} from './links'
export {manageCollateralMessages} from './manage-collateral'
export {manageNotificationsMessages} from './manage-notifications'
export {menuMessages} from './menu'
export {notificationsMessages} from './notifications'
export {portfolioMessages} from './portfolio'
export {receiveMessages} from './receive'
export {registerCatalystMessages} from './register-catalyst'
export {scanMessages} from './scan'
export {sendMessages} from './send'
export {settingsMessages} from './settings'
export {setupWalletMessages} from './setup-wallet'
export {stakingMessages} from './staking'
export {swapMessages} from './swap'
export {transactionsMessages} from './transactions'
export {txReviewMessages} from './txReview'
export {uiMessages} from './ui'
export {walletManagerMessages} from './wallet-manager'

// Re-export global messages for backward compatibility
export {
  actionMessages,
  confirmationMessages,
  currencyNames,
  errorMessages,
  default as globalMessages,
  themeNames,
  txLabels,
} from './global'
