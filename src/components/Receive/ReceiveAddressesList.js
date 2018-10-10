// @flow

import React from 'react'
import {View} from 'react-native'

import CustomText from '../../components/CustomText'
import ReceiveAddressesListItem from './ReceiveAddressesListItem'

import styles from './styles/ReceiveAddressesList.style'

type Props = {
  receiveAddresses: Array<string>,
};

const ReceiveAddressesList = ({receiveAddresses}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <CustomText style={styles.addressLabel}>i18nYour wallet addresses</CustomText>
    </View>
    {receiveAddresses.map((receiveAddress) => (
      <View key={receiveAddress} style={styles.addressContainer}>
        <ReceiveAddressesListItem receiveAddress={receiveAddress} />
      </View>
    ))}
  </View>
)

export default ReceiveAddressesList
