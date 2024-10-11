import {SpacingSize, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../Space/Space'

export const Divider = ({verticalSpace = 'none'}: {verticalSpace?: SpacingSize}) => {
  const {styles} = useStyles()
  return (
    <>
      <Space height={verticalSpace} />

      <View style={styles.divider} />

      <Space height={verticalSpace} />
    </>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      ...atoms.align_stretch,
      backgroundColor: color.gray_200,
    },
  })

  return {styles} as const
}
