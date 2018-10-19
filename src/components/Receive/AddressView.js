// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'

import {Text} from '../UiKit'
import CopyIcon from '../../assets/CopyIcon'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {COLORS} from '../../styles/config'

import styles from './styles/AddressView.style'

type Props = {
  address: string,
  navigateToModal: () => void,
};

const AddressView = ({address, navigateToModal}: Props) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={navigateToModal}
  >
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={styles.address}>{address}</Text>
      </View>
      <View style={styles.iconContainer}>
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </View>
    </View>
  </TouchableHighlight>
)

export default compose(
  withHandlers({
    navigateToModal: ({navigation, address}) => () =>
      navigation.navigate(RECEIVE_ROUTES.ADDRESS_MODAL, {address}),
  })
)(AddressView)
