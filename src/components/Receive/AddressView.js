// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {View, TouchableOpacity, Image} from 'react-native'
import {withNavigation} from 'react-navigation'

import {
  isUsedAddressIndexSelector,
  externalAddressIndexSelector,
} from '../../selectors'

import {Text} from '../UiKit'
import AddressModal from './AddressModal'

import styles from './styles/AddressView.style'
import copyIcon from '../../assets/img/icon/copy.png'

import type {ComponentType} from 'react'

type Props = {
  index: number,
  address: string,
  isUsed: boolean,
  openDetails: () => void,
  closeDetails: () => void,
  showDetails: boolean,
}

const AddressView = ({
  address,
  showDetails,
  index,
  isUsed,
  openDetails,
  closeDetails,
}: Props) => (
  <>
    <TouchableOpacity activeOpacity={0.5} onPress={openDetails}>
      <View style={styles.container}>
        <View style={styles.addressContainer}>
          <Text secondary={isUsed} small bold style={index}>{`/${index}`}</Text>
          <Text
            secondary={isUsed}
            small
            numberOfLines={1}
            ellipsizeMode="middle"
            monospace
            style={styles.text}
          >
            {address}
          </Text>
        </View>
        <Image source={copyIcon} width={24} />
      </View>
    </TouchableOpacity>
    <AddressModal
      visible={showDetails}
      address={address}
      onRequestClose={closeDetails}
    />
  </>
)

type ExternalProps = {
  address: string,
}

export default (compose(
  // TODO(ppershing): this makes Flow bail out from checking types
  withNavigation,
  connect((state, {address}) => ({
    index: externalAddressIndexSelector(state)[address],
    isUsed: !!isUsedAddressIndexSelector(state)[address],
  })),
  withStateHandlers(
    {
      showDetails: false,
    },
    {
      openDetails: (state) => () => ({showDetails: true}),
      closeDetails: (state) => () => ({showDetails: false}),
    },
  ),
)(AddressView): ComponentType<ExternalProps>)
