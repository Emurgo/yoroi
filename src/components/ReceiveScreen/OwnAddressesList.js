// @flow

import React, {Component} from 'react'
import {View} from 'react-native'

import OwnAddressesListItem from './OwnAddressesListItem'

import styles from './OwnAddressesList.style'

type Props = {
    ownAddresses: Array<string>,
};

class OwnAddressesList extends Component<Props> {
  render() {
    const {ownAddresses} = this.props

    return (
      <View style={styles.listContainer}>
        {Array(ownAddresses).map((ownAddress) => (
          <View key={ownAddress} style={styles.addressContainer}>
            <OwnAddressesListItem ownAddress={ownAddress} />
          </View>
        ))}
      </View>
    )
  }
}

export default OwnAddressesList
