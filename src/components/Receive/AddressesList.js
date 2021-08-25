// @flow

import React from 'react'
import {FlatList} from 'react-native'
import {useSelector} from 'react-redux'

import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {isUsedAddressIndexSelector} from '../../selectors'
import {Spacer} from '../UiKit'
import AddressView from './AddressView'

type AddressesListProps = {
  addresses: Map<string, AddressDTOCardano>,
  showFresh?: boolean,
}

const AddressesList = ({addresses, showFresh}: AddressesListProps) => {
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)
  const allAddresses = [...addresses.values()]
  const shownAddresses: AddressDTOCardano[] = showFresh
    ? allAddresses.filter((addrInfo) => !isUsedAddressIndex[addrInfo.address]).reverse()
    : allAddresses.filter((addrInfo) => isUsedAddressIndex[addrInfo.address]).reverse()

  return (
    <FlatList
      data={shownAddresses}
      keyExtractor={(addressInfo) => addressInfo.address}
      renderItem={({item: addressInfo}) => <AddressView addressInfo={addressInfo} />}
      ItemSeparatorComponent={() => <Spacer height={16} />}
    />
  )
}

export default AddressesList
