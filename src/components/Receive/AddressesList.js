// @flow

import React from 'react'
import {compose} from 'redux'
import {FlatList} from 'react-native'
import {connect} from 'react-redux'

import {isUsedAddressIndexSelector} from '../../selectors'
import AddressView from './AddressView'
import {AddressDTOCardano} from '../../crypto/Address.dto'

import type {ComponentType} from 'react'

const _keyExtractor = (addressInfo) => addressInfo?.address
const _renderItem = ({item: addressInfo}) => (
  <AddressView addressInfo={addressInfo} />
)

const AddressesList = ({addresses, isUsedAddressIndex, showFresh}) => {
  const toFilter = [...addresses.values()]
  const shownAddresses = showFresh
    ? toFilter.filter((addrInfo) => !isUsedAddressIndex[addrInfo.address])
    : toFilter.filter((addrInfo) => isUsedAddressIndex[addrInfo.address])
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

type ExternalProps = {|
  addresses: Map<string, AddressDTOCardano>,
  showFresh?: boolean,
|}

export default (compose(
  connect((state) => ({
    isUsedAddressIndex: isUsedAddressIndexSelector(state),
  })),
)(AddressesList): ComponentType<ExternalProps>)
