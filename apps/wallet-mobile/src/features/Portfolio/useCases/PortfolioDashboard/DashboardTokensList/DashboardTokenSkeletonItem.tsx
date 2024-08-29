import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Spacer} from '../../../../../components'

export const DashboardTokenSkeletonItem = () => {
  const {color, styles} = useStyles()

  return (
    <View style={styles.fullSize}>
      <View style={styles.root}>
        <SkeletonPlaceholder backgroundColor={color.gray_100}>
          <SkeletonPlaceholder.Item flexDirection="row" gap={12} alignItems="center">
            <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} />

            <SkeletonPlaceholder.Item flexDirection="column" gap={6}>
              <SkeletonPlaceholder.Item width={39} height={16} borderRadius={8} />

              <SkeletonPlaceholder.Item width={53} height={12} borderRadius={8} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>

        <Spacer fill />

        <SkeletonPlaceholder backgroundColor={color.gray_100}>
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item width={64} height={20} borderRadius={8} marginBottom={7} />

            <SkeletonPlaceholder.Item width={128} height={16} borderRadius={8} marginBottom={7} />

            <SkeletonPlaceholder.Item width={75} height={12} borderRadius={8} marginVertical={3} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    </View>
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
      ...atoms.w_full,
      ...atoms.h_full,
      borderColor: color.gray_300,
    },
    fullSize: {
      ...atoms.w_full,
      ...atoms.h_full,
    },
  })

  return {styles, color} as const
}
