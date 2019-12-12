// @flow
import React from 'react'
import {withHandlers} from 'recompose'
import {Linking, TouchableOpacity} from 'react-native'

import {Text} from '../UiKit'
import {CARDANO_CONFIG} from '../../config'

import type {ComponentType} from 'react'

type handlerProps = {
  address: string,
}
type Props = {
  address: string,
  onPress: () => any,
}

const AddressEntry: ComponentType<handlerProps> = withHandlers({
  onPress: ({address}: {address: string}) => () =>
    Linking.openURL(CARDANO_CONFIG.SHELLEY.EXPLORER_URL_FOR_ADDRESS(address)),
})(({address, onPress}: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
      <Text secondary>{address}</Text>
    </TouchableOpacity>
  )
})

export default AddressEntry
