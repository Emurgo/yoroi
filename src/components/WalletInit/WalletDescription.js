// @flow

import React from 'react'
import {View} from 'react-native'
import {connect} from 'react-redux'

import YoroiWalletIcon from '../../assets/YoroiWalletIcon'
import EmurgoIcon from '../../assets/EmurgoIcon'
import {Text} from '../UiKit'

import {COLORS} from '../../styles/config'
import styles from './styles/WalletInitScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.walletDescription

type Props = {
  translations: SubTranslation<typeof getTranslations>,
}

const WalletDescription = ({translations}: Props) => (
  <View style={styles.descriptionContainer}>
    <YoroiWalletIcon color={COLORS.WHITE} width={140} height={80} />

    <View style={styles.subtitleContainer}>
      <Text style={styles.subtitle}>{translations.line1}</Text>
    </View>

    <Text style={styles.subtitle}>{translations.line2}</Text>

    <View style={styles.emurgoCreditsContainer}>
      <Text style={styles.subtitle}>{translations.byEmurgo}</Text>
      <EmurgoIcon color={COLORS.WHITE} width={100} height={37} />
    </View>
  </View>
)

export default connect((state) => ({
  translations: getTranslations(state),
}))(WalletDescription)
