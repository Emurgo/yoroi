// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import CustomText from '../../components/CustomText'
import ReceiveAddressDetail from './ReceiveAddressDetail'
import ReceiveAddressesList from './ReceiveAddressesList'

import styles from './styles/ReceiveScreen.style'


type Props = {
  receiveAddresses: Array<string>,
};

const ReceiveScreen = ({receiveAddresses}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <View style={styles.warningContainer}>
        <CustomText style={styles.warningText}>i18nShare this wallet to receive payments.</CustomText>
        <CustomText style={styles.warningText}>i18nTo protect your privacy, new address are </CustomText>
        <CustomText style={styles.warningText}>i18ngenerated automatically once you use them.</CustomText>
      </View>
      <ReceiveAddressDetail receiveAddress={receiveAddresses[0]} />
      <ReceiveAddressesList receiveAddresses={receiveAddresses} />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    receiveAddresses: state.receiveAddresses,
  })),
)(ReceiveScreen)
