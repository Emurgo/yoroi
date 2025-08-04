import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {CreatePinInput} from '../shared/CreatePinInput/CreatePinInput'

export const CreatePinScreen: React.FC<Props> = ({onDone}) => {
  return (
    <View style={[a.flex_1]}>
      <CreatePinInput onDone={onDone} />
    </View>
  )
}

type Props = {
  onDone(): void
}
