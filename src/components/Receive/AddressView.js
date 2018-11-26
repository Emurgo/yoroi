// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {View, TouchableOpacity} from 'react-native'
import {withNavigation} from 'react-navigation'

import {
  isUsedAddressIndexSelector,
  externalAddressIndexSelector,
} from '../../selectors'

import {Text} from '../UiKit'
import CopyIcon from '../../assets/CopyIcon'
import AddressModal from './AddressModal'

import styles from './styles/AddressView.style'

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
  <TouchableOpacity activeOpacity={0.5} onPress={openDetails}>
    <View style={styles.container}>
      <View style={styles.addressContainer}>
        <Text secondary={isUsed} small>
          {`/${index}`} {address}
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <CopyIcon width={24} height={24} />
      </View>
      <AddressModal
        visible={showDetails}
        address={address}
        onRequestClose={closeDetails}
      />
    </View>
  </TouchableOpacity>
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
  withState('showDetails', 'setShowDetails', false),
  withHandlers({
    closeDetails: ({setShowDetails}) => () => setShowDetails(false),
    openDetails: ({setShowDetails}) => () => setShowDetails(true),
  }),
)(AddressView): ComponentType<ExternalProps>)
