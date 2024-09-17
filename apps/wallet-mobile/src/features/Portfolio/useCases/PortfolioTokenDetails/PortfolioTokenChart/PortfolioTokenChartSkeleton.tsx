import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import ChartPlaceholder from '../../../../../assets/img/chart-placeholder.png'
import {Icon} from '../../../../../components/Icon'

export const PortfolioTokenChartSkeleton = () => {
  const {color, styles} = useStyles()
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.group}>
          <SkeletonPlaceholder borderRadius={20} backgroundColor={color.gray_100}>
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={2}>
              <SkeletonPlaceholder.Item width={48} height={24} />

              <SkeletonPlaceholder.Item width={64} height={24} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>

          <Icon.InfoCircle />
        </View>

        <SkeletonPlaceholder borderRadius={20} backgroundColor={color.gray_100}>
          <SkeletonPlaceholder.Item width={64} height={16} />
        </SkeletonPlaceholder>
      </View>

      <Image style={styles.chartPlaceholder} source={ChartPlaceholder} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_col,
    },
    container: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    group: {
      width: 128,
      ...atoms.flex_row,
      ...atoms.justify_start,
      ...atoms.align_center,
      ...atoms.gap_2xs,
    },
    chartPlaceholder: {
      height: 112,
      width: '100%',
      marginVertical: 16,
      resizeMode: 'stretch',
    },
  })
  return {styles, color} as const
}
