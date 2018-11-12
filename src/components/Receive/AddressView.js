// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {View, TouchableHighlight} from 'react-native'
import {withNavigation} from 'react-navigation'

import {Text} from '../UiKit'
import CopyIcon from '../../assets/CopyIcon'
import {RECEIVE_ROUTES} from '../../RoutesList'
import {COLORS} from '../../styles/config'

import styles from './styles/AddressView.style'

type Props = {
  index: number,
  address: string,
  isUsed: boolean,
  navigateToModal: () => void,
}

const AddressView = ({address, index, isUsed, navigateToModal}: Props) => (
  <TouchableHighlight
    activeOpacity={0.9}
    underlayColor={COLORS.WHITE}
    onPress={navigateToModal}
  >
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text style={isUsed ? styles.addressUsed : styles.addressNotUsed}>
          {`/${index}`} {address}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <CopyIcon width={styles.icon.size} height={styles.icon.size} />
      </View>
    </View>
  </TouchableHighlight>
)

export default compose(
  withNavigation,
  withHandlers({
    navigateToModal: ({navigation, address, index}) => () =>
      navigation.navigate(RECEIVE_ROUTES.ADDRESS_MODAL, {address, index}),
  }),
)(AddressView)
