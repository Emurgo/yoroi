// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View, TouchableHighlight} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from './WalletDescription'
import CustomText from '../CustomText'
import Screen from '../Screen'
import BackgroundVisualArtefacts from './BackgroundVisualArtefacts'
import {COLORS} from '../../styles/config'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from './WalletInitNavigator'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.walletInitScreen

type Props = {
  navigateRestoreWallet: () => mixed,
  navigateCreateWallet: () => mixed,
  trans: SubTranslation<typeof getTrans>,
}

const WalletInitScreen = ({navigateCreateWallet, navigateRestoreWallet, trans}: Props) => (
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

        <TouchableHighlight
          style={styles.button}
          activeOpacity={0.9}
          underlayColor={COLORS.WHITE}
          onPress={navigateCreateWallet}
        >
          <CustomText style={styles.buttonText}>
            {trans.createWallet}
          </CustomText>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.button}
          activeOpacity={0.1}
          underlayColor={COLORS.WHITE}
          onPress={navigateRestoreWallet}
        >
          <CustomText style={styles.buttonText}>
            {trans.restoreWallet}
          </CustomText>
        </TouchableHighlight>
      </View>
    </Screen>
  </LinearGradient>
)

export default compose(
  connect((state: State) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateRestoreWallet:
      ({navigation}) => (event) => navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET),
    navigateCreateWallet:
      ({navigation}) => (event) => navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
  })
)(WalletInitScreen)
