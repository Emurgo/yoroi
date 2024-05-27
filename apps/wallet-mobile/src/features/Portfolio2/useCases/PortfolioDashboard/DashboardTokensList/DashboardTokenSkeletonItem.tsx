import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Spacer} from '../../../../../components'

export const DashboardTokenSkeletonItem = () => {
  const {color, styles} = useStyles()

  return (
    <SkeletonPlaceholder backgroundColor={color.gray_c100}>
      <View style={styles.root}>
        <SkeletonPlaceholder.Item flexDirection="row" gap={12} alignItems="center">
          <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} />

          <SkeletonPlaceholder.Item flexDirection="column" gap={6}>
            <SkeletonPlaceholder.Item width={39} height={16} borderRadius={8} />

            <SkeletonPlaceholder.Item width={53} height={12} borderRadius={8} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <Spacer height={16} />

        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={64} height={20} borderRadius={8} marginBottom={7} />

          <SkeletonPlaceholder.Item width={128} height={16} borderRadius={8} marginBottom={7} />

          <SkeletonPlaceholder.Item width={75} height={12} borderRadius={8} marginVertical={3} />
        </SkeletonPlaceholder.Item>
      </View>
    </SkeletonPlaceholder>
  )
}
const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.p_lg,
      ...atoms.rounded_sm,
      ...atoms.flex_col,
      ...atoms.align_start,
      ...atoms.border,
      borderColor: color.gray_c300,
      width: 164,
    },
  })

  return {styles, color} as const
}
