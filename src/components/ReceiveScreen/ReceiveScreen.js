// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import ReceiveAddressesList from './ReceiveAddressesList'

import styles from './ReceiveScreen.style'

type Props = {
  receiveAddresses: Array<string>,
};


class ReceiveScreen extends Component<Props> {
  render() {
    const {receiveAddresses} = this.props

    return (
      <View style={styles.root}>
        <Screen scroll>
          <ReceiveAddressesList receiveAddresses={receiveAddresses} />
        </Screen>
      </View>
    )
  }
}

export default compose(
  connect((state) => ({
    receiveAddresses: state.receiveAddresses,
  })),
)(ReceiveScreen)
