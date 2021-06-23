// @flow
import React from 'react'
import {Linking, TouchableOpacity} from 'react-native'

import {Text} from '../UiKit'

type Props = {
  address: string,
  explorerForAddress: (string) => string,
}

const AddressEntry = ({address, explorerForAddress}: Props) => {
  const onPress = () => Linking.openURL(explorerForAddress(address))

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text secondary>{address}</Text>
    </TouchableOpacity>
  )
}

export default AddressEntry
