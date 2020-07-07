// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import WalletDescription from './WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
// uses same styles as WalletInitScreen
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {walletIsInitializedSelector} from '../../selectors'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  addWalletButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
  addWalletOnShelleyButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Shelley Testnet)',
  },
})

type Props = {|
  intl: any,
  walletIsInitialized: boolean,
  navigation: Navigation,
  navigateInitWallet: (Object, boolean) => mixed,
|}

const WalletInitScreen = ({
  intl,
  walletIsInitialized,
  navigation,
  navigateInitWallet,
}: Props) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <WalletDescription />
          </View>
          <Button
            onPress={(event) => navigateInitWallet(event, false)}
            title={intl.formatMessage(messages.addWalletButton)}
            style={styles.createButton}
            testID="addWalletOnByronButton"
          />

          <Button
            outline
            onPress={(event) => navigateInitWallet(event, true)}
            title={intl.formatMessage(messages.addWalletOnShelleyButton)}
            testID="addWalletOnShelleyButton"
          />
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}
export default injectIntl(
  compose(
    connect((state: State) => ({
      walletIsInitialized: walletIsInitializedSelector(state),
    })),
    withHandlers({
      navigateInitWallet: ({navigation}) => (event, isShelleyWallet) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
          isShelleyWallet,
        }),
    }),
  )(WalletInitScreen),
)
