// @flow

import React from 'react'
import {View} from 'react-native'

import ReceiveAddressesListItem from './ReceiveAddressesListItem'

import styles from './ReceiveAddressesList.style'

type Props = {
  receiveAddresses: Array<string>,
};

const ReceiveAddressesList = ({receiveAddresses}: Props) => (
  <View style={styles.listContainer}>
    {receiveAddresses.map((receiveAddress) => (
      <View key={receiveAddress} style={styles.addressContainer}>
        <ReceiveAddressesListItem receiveAddress={receiveAddress} />
      </View>
    ))}
  </View>
)

export default ReceiveAddressesList
