// @flow

import React from 'react'
import {compose} from 'redux'
import {FlatList} from 'react-native'
import {connect} from 'react-redux'

import {withTranslations} from '../../utils/renderUtils'
import {isUsedAddressIndexSelector} from '../../selectors'
import AddressView from './AddressView'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.ReceiveScreen.addressesList

const _keyExtractor = (address) => address
const _renderItem = ({item: address}) => <AddressView address={address} />

const AddressesList = ({
  addresses,
  isUsedAddressIndex,
  showFresh,
  translations,
}) => {
  const shownAddresses = showFresh
    ? addresses.filter((addr) => !isUsedAddressIndex[addr])
    : addresses.filter((addr) => isUsedAddressIndex[addr])
  // We want newest first
  shownAddresses.reverse()

  return (
    <FlatList
      data={shownAddresses}
      keyExtractor={_keyExtractor}
      renderItem={_renderItem}
    />
  )
}

type ExternalProps = {
  addresses: Array<string>,
  showFresh?: boolean,
}

export default (compose(
  withTranslations(getTranslations),
  connect((state) => ({
    isUsedAddressIndex: isUsedAddressIndexSelector(state),
  })),
)(AddressesList): ComponentType<ExternalProps>)
