import React, {Component} from 'react'
import {Text} from 'react-native'

// import CustomText from '../../components/CustomText'

import styles from './OwnAddressesListItem.style'

type Props = {
    ownAddress: string,
};

class OwnAddressesListItem extends Component<Props> {
  render() {
    const {ownAddress} = this.props

    return (
      <Text style={styles.address}>{ownAddress}</Text>
    )
  }
}

export default OwnAddressesListItem
