// @flow
import React from 'react'
import {withHandlers} from 'recompose'
import {Linking, TouchableOpacity} from 'react-native'

import {Text} from '../UiKit'

import type {ComponentType} from 'react'

type handlerProps = {
  address: string,
  explorerForAddress: (string) => string,
}
type Props = {
  address: string,
  onPress: () => any,
  explorerForAddress: (string) => string,
}

const AddressEntry: ComponentType<handlerProps> = withHandlers({
  onPress:
    ({address, explorerForAddress}) =>
    () =>
      Linking.openURL(explorerForAddress(address)),
})(({address, onPress}: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text secondary>{address}</Text>
    </TouchableOpacity>
  )
})

export default AddressEntry
