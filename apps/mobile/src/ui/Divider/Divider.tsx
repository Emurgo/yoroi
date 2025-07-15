import {SpacingSize, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../Space/Space'

export const Divider = ({
  verticalSpace = 'none',
}: {
  verticalSpace?: SpacingSize
}) => {
  const {color, atoms} = useTheme()
  return (
    <>
      <Space height={verticalSpace} />

      <View
        style={[
          styles.divider,
          atoms.align_stretch,
          {backgroundColor: color.gray_200},
        ]}
      />

      <Space height={verticalSpace} />
    </>
  )
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
  },
})
