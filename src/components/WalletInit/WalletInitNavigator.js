// @flow
import {createStackNavigator} from 'react-navigation'

import WalletInitScreen from './WalletInitScreen'
import CreateWalletScreen from './CreateWallet/CreateWalletScreen'
import RestoreWalletScreen from './RestoreWallet/RestoreWalletScreen'
import MnemonicShowScreen from './CreateWallet/MnemonicShowScreen'
import {
  defaultStackNavigatorOptions,
  backButtonNavigatorOptions,
} from '../../utils/navigation'
import MnemonicCheckScreen from './CreateWallet/MnemonicCheckScreen'
import WalletCredentialsScreen from './RestoreWallet/WalletCredentialsScreen'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
// eslint-disable-next-line max-len
import WalletSelectionScreen from '../../components/WalletSelection/WalletSelectionScreen'

const WalletInitNavigator = createStackNavigator(
  {
    [WALLET_INIT_ROUTES.WALLET_SELECTION]: {
      screen: WalletSelectionScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH]: {
      screen: WalletInitScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH]: {
      screen: WalletInitScreen,
    },
    [WALLET_INIT_ROUTES.CREATE_WALLET]: CreateWalletScreen,
    [WALLET_INIT_ROUTES.RESTORE_WALLET]: RestoreWalletScreen,
    [WALLET_INIT_ROUTES.MNEMONIC_SHOW]: MnemonicShowScreen,
    [WALLET_INIT_ROUTES.MNEMONIC_CHECK]: MnemonicCheckScreen,
    [WALLET_INIT_ROUTES.WALLET_CREDENTIALS]: WalletCredentialsScreen,
  },
  {
    initialRouteName: WALLET_INIT_ROUTES.WALLET_SELECTION,
    navigationOptions: ({navigation}) => backButtonNavigatorOptions,
    cardStyle: {
      backgroundColor: 'transparent',
    },
    ...defaultStackNavigatorOptions,
  },
)

export default WalletInitNavigator
