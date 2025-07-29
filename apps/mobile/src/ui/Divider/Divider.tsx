import {atoms as a, SpacingSize, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {Space} from '~/ui/Space/Space'

export const Divider = ({
  verticalSpace = 'none',
}: {
  verticalSpace?: SpacingSize
}) => {
  const {palette: p} = useTheme()
  return (
    <>
      <Space.Height.xs />

      <View
        style={[{height: 1}, a.align_stretch, {backgroundColor: p.gray_200}]}
      />

      <Space.Height.xs />
    </>
  )
}
