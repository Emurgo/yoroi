import React from 'react'
import {Text} from 'react-native'

// import CustomText from '../../components/CustomText'

import styles from './ReceiveAddressesListItem.style'

type Props = {
  receiveAddresses: string,
};

const ReceiveAddressesListItem = ({receiveAddress}: Props) => (
  <Text style={styles.address}>{receiveAddress}</Text>
)

export default ReceiveAddressesListItem
