import {SpacingSize, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {Space} from '~/Space/Space'

export const Divider = ({
  verticalSpace = 'none',
}: {
  verticalSpace?: SpacingSize
}) => {
  const {palette: p, atoms} = useTheme()
  return (
    <>
      <Space height={verticalSpace} />

      <View
        style={[
          {height: 1},
          atoms.align_stretch,
          {backgroundColor: p.gray_200},
        ]}
      />

      <Space height={verticalSpace} />
    </>
  )
}
