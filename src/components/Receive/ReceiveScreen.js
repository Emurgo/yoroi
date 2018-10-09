// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import ReceiveAddressesList from './ReceiveAddressesList'

import styles from './styles/ReceiveScreen.style'

type Props = {
  receiveAddresses: Array<string>,
};

const ReceiveScreen = ({receiveAddresses}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <ReceiveAddressesList receiveAddresses={receiveAddresses} />
    </Screen>
  </View>
)

export default compose(
  connect((state) => ({
    receiveAddresses: state.receiveAddresses,
  })),
)(ReceiveScreen)
