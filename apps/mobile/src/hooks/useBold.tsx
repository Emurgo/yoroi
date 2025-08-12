import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {Text, TextStyle} from 'react-native'

type UseBoldOptions = {
  style?: TextStyle
}

export const useBold = (options?: UseBoldOptions) => {
  return React.useMemo(
    () => ({
      b: (text: React.ReactNode) => (
        <Text style={[a.body_2_md_medium, options?.style]}>{text}</Text>
      ),
    }),
    [options?.style],
  )
}
