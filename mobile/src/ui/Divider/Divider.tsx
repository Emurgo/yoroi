import {SpacingSize, atoms as a, tokens, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

export const Divider = ({
  verticalSpace = 'xs',
}: {
  verticalSpace?: SpacingSize
}) => {
  const {palette: p} = useTheme()
  const spacing = tokens.space[verticalSpace]

  return (
    <View style={{paddingVertical: spacing}}>
      <View
        style={[{height: 1}, a.align_stretch, {backgroundColor: p.gray_200}]}
      />
    </View>
  )
}
