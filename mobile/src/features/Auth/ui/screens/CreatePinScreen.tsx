import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CreatePinInput} from '../shared/CreatePinInput/CreatePinInput'

export const CreatePinScreen: React.FC<Props> = ({onDone}) => {
  return (
    <SafeAreaView style={[a.flex_1]} edges={['left', 'right', 'bottom']}>
      <CreatePinInput onDone={onDone} />
    </SafeAreaView>
  )
}

type Props = {
  onDone(): void
}
