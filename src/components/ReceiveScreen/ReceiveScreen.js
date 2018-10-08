// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import Screen from '../../components/Screen'
import OwnAddressesList from './OwnAddressesList'

import styles from './ReceiveScreen.style'

type Props = {
  ownAddresses: Array<string>,
};


class ReceiveScreen extends Component<Props> {
  render() {
    const {ownAddresses} = this.props

    return (
      <View style={styles.root}>
        <Screen scroll>
          <OwnAddressesList ownAddresses={ownAddresses} />
        </Screen>
      </View>
    )
  }
}

export default compose(
  connect((state) => ({
    ownAddresses: state.ownAddresses,
  })),
)(ReceiveScreen)
