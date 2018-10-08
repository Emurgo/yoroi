// @flow

import React from 'react'
import {View} from 'react-native'
import {connect} from 'react-redux'

import YoroiWalletIcon from '../../assets/YoroiWalletIcon'
import EmurgoIcon from '../../assets/EmurgoIcon'
import CustomText from '../CustomText'

import {COLORS} from '../../styles/config'

import styles from './WalletInitScreen.style'

type Props = {
  text: {
    line1: string,
    line2: string,
    byEmurgo: string,
  },
};

const WalletDescription = ({text}: Props) => (
  <View style={styles.descriptionContainer}>
    <YoroiWalletIcon color={COLORS.WHITE} width={140} height={80} />

    <View style={styles.subtitleContainer}>
      <CustomText style={styles.subtitle}>
        {text.line1}
      </CustomText>
    </View>

    <CustomText style={styles.subtitle}>
      {text.line2}
    </CustomText>

    <View style={styles.emurgoCreditsContainer}>
      <CustomText style={styles.subtitle}>{text.byEmurgo}</CustomText>
      <EmurgoIcon color={COLORS.WHITE} width={100} height={37} />
    </View>
  </View>
)

export default connect((state) => ({
  text: state.l10n.walletDescription,
}))(WalletDescription)
