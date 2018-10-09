// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import YoroiWalletIcon from '../../assets/YoroiWalletIcon'
import EmurgoIcon from '../../assets/EmurgoIcon'
import Screen from '../Screen'
import CustomText from '../CustomText'
import LanguagePicker from './LanguagePicker'
import BackgroundVisualArtefacts from './BackgroundVisualArtefacts'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import {COLORS} from '../../styles/config'
import styles from './WalletInitScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTrans = (state: State) => state.l10n.walletInitScreen

type Props = {
  changeLanguageAction: () => void,
  navigation: NavigationScreenProp<NavigationState>,
  languageCode: string,
  trans: SubTranslation<typeof getTrans>,
}

const WalletInitScreen = ({navigation, trans}: Props) => (
  <LinearGradient
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    colors={[COLORS.PRIMARY_GRADIENT_START, COLORS.PRIMARY_GRADIENT_END]}
    style={styles.gradient}
  >
    <BackgroundVisualArtefacts />
    <Screen bgColor={COLORS.TRANSPARENT}>
      <View style={styles.container}>
        <View style={styles.descriptionContainer}>
          <YoroiWalletIcon color={COLORS.WHITE} width={140} height={80} />

          <View style={styles.subtitleContainer}>
            <CustomText style={styles.subtitle}>
              {trans.line1}
            </CustomText>
          </View>

          <CustomText style={styles.subtitle}>
            {trans.line2}
          </CustomText>

          <View style={styles.emurgoCreditsContainer}>
            <CustomText style={styles.subtitle}>{trans.byEmurgo}</CustomText>
            <EmurgoIcon color={COLORS.WHITE} width={100} height={37} />
          </View>
        </View>

        <LanguagePicker navigation={navigation} />
      </View>
    </Screen>
  </LinearGradient>
)

export default compose(
  connect((state: State) => ({
    trans: getTrans(state),
  })),
)(WalletInitScreen)
