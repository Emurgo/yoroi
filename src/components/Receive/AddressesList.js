// @flow

import type {ComponentType} from 'react'
import React from 'react'
import {FlatList} from 'react-native'
import {connect} from 'react-redux'
import {compose} from 'redux'

import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {isUsedAddressIndexSelector} from '../../selectors'
import AddressView from './AddressView'

const _keyExtractor = (addressInfo) => addressInfo?.address
const _renderItem = ({item: addressInfo}: {item: any}) => <AddressView addressInfo={addressInfo} />

type AddressesListProps = {
  addresses: Map<string, AddressDTOCardano>,
  isUsedAddressIndex: Dict<boolean>,
  showFresh?: boolean,
}
const AddressesList = ({addresses, isUsedAddressIndex, showFresh}: AddressesListProps) => {
  const toFilter = [...addresses.values()]
  const shownAddresses = showFresh
    ? toFilter.filter((addrInfo) => !isUsedAddressIndex[addrInfo.address])
    : toFilter.filter((addrInfo) => isUsedAddressIndex[addrInfo.address])
  // We want newest first
  shownAddresses.reverse()

  return <FlatList data={shownAddresses} keyExtractor={_keyExtractor} renderItem={_renderItem} />
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
