import {createStackNavigator} from 'react-navigation'
import LanguagePickerScreen from './LanguagePickerScreen'
import WalletInitScreen from './WalletInitScreen'
import CreateWalletScreen from './CreateWallet/CreateWalletScreen'
import RestoreWalletScreen from './RestoreWallet/RestoreWalletScreen'
import RecoveryPhraseScreen from './CreateWallet/RecoveryPhraseScreen'
import RecoveryPhraseExplanationDialog from './CreateWallet/RecoveryPhraseExplanationDialog'
import RecoveryPhraseConfirmationScreen from './CreateWallet/RecoveryPhraseConfirmationScreen'
import RecoveryPhraseConfirmationDialog from './CreateWallet/RecoveryPhraseConfirmationDialog'

export const WALLET_INIT_ROUTES = {
  MAIN: 'language-pick',
  INIT: 'wallet-init-mode',
  CREATE_WALLET: 'create-wallet-form',
  RESTORE_WALLET: 'restore-wallet-form',
  RECOVERY_PHRASE: 'recovery-phrase',
  RECOVERY_PHRASE_DIALOG: 'recovery-phrase-dialog',
  RECOVERY_PHRASE_CONFIRMATION: 'recovery-phrase-confirmation',
  RECOVERY_PHRASE_CONFIRMATION_DIALOG: 'recovery-phrase-confirmation-dialog',
}

const WalletInitNavigator = createStackNavigator({
  [WALLET_INIT_ROUTES.MAIN]: LanguagePickerScreen,
  [WALLET_INIT_ROUTES.INIT]: WalletInitScreen,
  [WALLET_INIT_ROUTES.CREATE_WALLET]: CreateWalletScreen,
  [WALLET_INIT_ROUTES.RESTORE_WALLET]: RestoreWalletScreen,
  [WALLET_INIT_ROUTES.RECOVERY_PHRASE]: RecoveryPhraseScreen,
  [WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG]: RecoveryPhraseExplanationDialog,
  [WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION]: RecoveryPhraseConfirmationScreen,
  [WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG]: RecoveryPhraseConfirmationDialog,
}, {
  initialRouteName: WALLET_INIT_ROUTES.MAIN,
  navigationOptions: {
    header: null,
  },
  cardStyle: {
    backgroundColor: 'transparent',
  },
})

export default WalletInitNavigator
