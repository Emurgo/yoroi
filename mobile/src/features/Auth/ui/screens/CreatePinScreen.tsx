import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CreatePinInput} from '../shared/CreatePinInput/CreatePinInput'

export const CreatePinScreen: React.FC<Props> = ({onDone}) => {
  const {atoms: ta} = useTheme()
  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      <CreatePinInput onDone={onDone} />
    </SafeAreaView>
  )
}

type Props = {
  onDone(): void
}
