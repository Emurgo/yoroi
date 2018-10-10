// @flow

import React from 'react'
import {View} from 'react-native'

import CustomText from '../../components/CustomText'
import type {SubTranslation} from '../../l10n/typeHelpers'

import styles from './styles/ReceiveAddressesList.style'

const getTranslation = (state) => state.trans.receiveScreen

type Props = {
  receiveAddresses: Array<string>,
  translation: SubTranslation<typeof getTranslation>,
};

const ReceiveAddressesList = ({receiveAddresses, translation}: Props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <CustomText style={styles.addressLabel}>{translation.walletAddresses}</CustomText>
    </View>
    {receiveAddresses.map((receiveAddress) => (
      <View key={receiveAddress} style={styles.addressContainer}>
        <CustomText style={styles.address}>{receiveAddress}</CustomText>
      </View>
    ))}
  </View>
)

export default ReceiveAddressesList
