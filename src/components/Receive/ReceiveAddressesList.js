// @flow

import React from 'react'
import {View} from 'react-native'

import CustomText from '../../components/CustomText'
import type {Translation} from '../../l10n/type'

import styles from './styles/ReceiveAddressesList.style'

type Props = {
  receiveAddresses: Array<string>,
  translation: Translation,
};

const ReceiveAddressesList = ({receiveAddresses, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <CustomText style={styles.addressLabel}>{translation.receiveScreen.addresses}</CustomText>
    </View>
    {receiveAddresses.map((receiveAddress) => (
      <View key={receiveAddress} style={styles.addressContainer}>
        <CustomText style={styles.address}>{receiveAddress}</CustomText>
      </View>
    ))}
  </View>
)

export default ReceiveAddressesList
