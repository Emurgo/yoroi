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
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {walletIsInitializedSelector} from '../../selectors'

import type {State} from '../../state'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add wallet',
    description: 'some desc',
  },
  createWalletButton: {
    id: 'components.walletinit.walletinitscreen.createWalletButton',
    defaultMessage: '!!!Create wallet',
    description: 'some desc',
  },
  restoreWalletButton: {
    id: 'components.walletinit.walletinitscreen.restoreWalletButton',
    defaultMessage: '!!!Restore wallet',
    description: 'some desc',
  },
  restoreShelleyWalletButton: {
    id: 'components.walletinit.walletinitscreen.restoreShelleyWalletButton',
    defaultMessage: '!!!Restore wallet (Shelley Testnet)',
    description: 'some desc',
  },
})

type Props = {
  navigateRestoreWallet: (Object, boolean) => mixed,
  navigateCreateWallet: () => mixed,
  intl: any,
  walletIsInitialized: boolean,
}

const WalletInitScreen = ({
  navigateCreateWallet,
  navigateRestoreWallet,
  intl,
  walletIsInitialized,
}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <WalletDescription />
        </View>

        <Button
          onPress={navigateCreateWallet}
          title={intl.formatMessage(messages.createWalletButton)}
          style={styles.createButton}
        />

        <Button
          outline
          onPress={(event) => navigateRestoreWallet(event, false)}
          title={intl.formatMessage(messages.restoreWalletButton)}
          style={styles.createButton}
        />

        <Button
          outline
          onPress={(event) => navigateRestoreWallet(event, true)}
          title={intl.formatMessage(messages.restoreShelleyWalletButton)}
          shelleyTheme
        />
      </View>
    </ScreenBackground>
  </SafeAreaView>
)

export default injectIntl(
  compose(
    connect((state: State) => ({
      walletIsInitialized: walletIsInitializedSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateRestoreWallet: ({navigation}) => (event, isShelleyWallet) =>
        navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
          isShelleyWallet,
        }),
      navigateCreateWallet: ({navigation}) => (event) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
    }),
  )(WalletInitScreen),
)
