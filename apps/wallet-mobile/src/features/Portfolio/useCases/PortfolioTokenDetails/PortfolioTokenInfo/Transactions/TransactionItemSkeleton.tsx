import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const TransactionItemSkeleton = () => {
  const {color, styles} = useStyles()
  return (
    <View style={styles.root}>
      <SkeletonPlaceholder borderRadius={8} backgroundColor={color.gray_c100}>
        <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between" alignItems="center" gap={16}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={16}>
            <SkeletonPlaceholder.Item borderRadius={40} width={48} height={48} />

            <SkeletonPlaceholder.Item flexDirection="column" alignItems="flex-start" gap={8}>
              <SkeletonPlaceholder.Item width={69} height={24} />

              <SkeletonPlaceholder.Item width={85} height={16} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="column" alignItems="flex-end" gap={8}>
            <SkeletonPlaceholder.Item width={186} height={24} />

            <SkeletonPlaceholder.Item width={73} height={16} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      minHeight: 48,
    },
  })
  return {styles, color} as const
}
