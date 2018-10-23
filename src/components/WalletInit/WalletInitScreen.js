// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from './WalletDescription'
import {Button} from '../UiKit'
import Screen from '../Screen'
import BackgroundVisualArtefacts from './BackgroundVisualArtefacts'
import {COLORS} from '../../styles/config'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.walletInitScreen

type Props = {
  navigateRestoreWallet: () => mixed,
  navigateCreateWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const WalletInitScreen = ({navigateCreateWallet, navigateRestoreWallet, translations}: Props) => (
  <LinearGradient
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    colors={[COLORS.PRIMARY_GRADIENT_START, COLORS.PRIMARY_GRADIENT_END]}
    style={styles.gradient}
  >
    <BackgroundVisualArtefacts />
    <Screen bgColor={COLORS.TRANSPARENT}>
      <View style={styles.container}>
        <WalletDescription />

        <Button
          onPress={navigateCreateWallet}
          title={translations.createWallet}
        />

        <Button
          onPress={navigateRestoreWallet}
          title={translations.restoreWallet}
        />
      </View>
    </Screen>
  </LinearGradient>
)

export default compose(
  connect((state: State) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateRestoreWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET),
    navigateCreateWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
  })
)(WalletInitScreen)
