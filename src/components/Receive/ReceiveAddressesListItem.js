import React from 'react'
// import {View} from 'react-native'

import CustomText from '../../components/CustomText'

import styles from './styles/ReceiveAddressesListItem.style'

type Props = {
  receiveAddress: string,
};

const ReceiveAddressesListItem = ({receiveAddress}: Props) => (
  <CustomText style={styles.address}>{receiveAddress}</CustomText>
)

export default ReceiveAddressesListItem
