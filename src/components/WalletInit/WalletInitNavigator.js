// @flow
import React from 'react'
import {createStackNavigator} from 'react-navigation'

import WalletInitScreen from './WalletInitScreen'
import CreateWalletScreen from './CreateWallet/CreateWalletScreen'
import RestoreWalletScreen from './RestoreWallet/RestoreWalletScreen'
import RecoveryPhraseScreen from './CreateWallet/RecoveryPhraseScreen'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {defaultNavigationOptions} from '../../navigationOptions'
// eslint-disable-next-line max-len
import RecoveryPhraseExplanationDialog from './CreateWallet/RecoveryPhraseExplanationDialog'
// eslint-disable-next-line max-len
import RecoveryPhraseConfirmationScreen from './CreateWallet/RecoveryPhraseConfirmationScreen'
// eslint-disable-next-line max-len
import RecoveryPhraseConfirmationDialog from './CreateWallet/RecoveryPhraseConfirmationDialog'
import {WALLET_INIT_ROUTES} from '../../RoutesList'

const WalletInitNavigator = createStackNavigator(
  {
    [WALLET_INIT_ROUTES.MAIN]: {
      screen: WalletInitScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_INIT_ROUTES.CREATE_WALLET]: CreateWalletScreen,
    [WALLET_INIT_ROUTES.RESTORE_WALLET]: RestoreWalletScreen,
    [WALLET_INIT_ROUTES.RECOVERY_PHRASE]: RecoveryPhraseScreen,
    // eslint-disable-next-line max-len
    [WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG]: RecoveryPhraseExplanationDialog,
    // eslint-disable-next-line max-len
    [WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG]: RecoveryPhraseConfirmationDialog,
    // eslint-disable-next-line max-len
    [WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION]: RecoveryPhraseConfirmationScreen,
  },
  {
    initialRouteName: WALLET_INIT_ROUTES.MAIN,
    navigationOptions: ({navigation}) => ({
      title: navigation.getParam('title'),
      headerLeft: <HeaderBackButton navigation={navigation} />,
      ...defaultNavigationOptions,
    }),
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
)

export default WalletInitNavigator
