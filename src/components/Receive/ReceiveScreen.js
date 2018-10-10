// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import CustomText from '../../components/CustomText'
import ReceiveAddressDetail from './ReceiveAddressDetail'
import ReceiveAddressesList from './ReceiveAddressesList'
import type {Translation} from '../../l10n/type'

import styles from './styles/ReceiveScreen.style'

type Props = {
  receiveAddresses: Array<string>,
  translation: Translation,
};

const ReceiveScreen = ({receiveAddresses, translation}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <View style={styles.warningContainer}>
        <CustomText style={styles.warningText}>{translation.receiveScreen.warning.line1}</CustomText>
        <CustomText style={styles.warningText}>{translation.receiveScreen.warning.line2}</CustomText>
        <CustomText style={styles.warningText}>{translation.receiveScreen.warning.line3}</CustomText>
      </View>
      <ReceiveAddressDetail receiveAddress={receiveAddresses[0]} translation={translation} />
      <ReceiveAddressesList receiveAddresses={receiveAddresses} translation={translation} />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    receiveAddresses: state.receiveAddresses,
    translation: state.trans,
  })),
)(ReceiveScreen)
