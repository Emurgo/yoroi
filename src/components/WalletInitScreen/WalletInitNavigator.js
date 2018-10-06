import {createStackNavigator} from 'react-navigation'
import WalletInitScreen from './WalletInitScreen'

const WALLET_INIT_ROUTES = {
  MAIN: 'main',
}

const WalletInitNavigator = createStackNavigator({
  [WALLET_INIT_ROUTES.MAIN]: WalletInitScreen,
}, {
  initialRouteName: WALLET_INIT_ROUTES.MAIN,
  navigationOptions: {
    header: null,
  },
})

export default WalletInitNavigator
