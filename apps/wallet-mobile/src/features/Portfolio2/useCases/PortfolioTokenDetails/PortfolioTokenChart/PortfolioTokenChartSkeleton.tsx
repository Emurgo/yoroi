import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Image, StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import ChartPlaceholder from '../../../../../assets/img/chart-placeholder.png'
import {Icon, Tooltip} from '../../../../../components'

export const PortfolioTokenChartSkeleton = () => {
  const {color, styles} = useStyles()
  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.group}>
          <SkeletonPlaceholder borderRadius={20} backgroundColor={color.gray_c100}>
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={2}>
              <SkeletonPlaceholder.Item width={48} height={24} />

              <SkeletonPlaceholder.Item width={64} height={24} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>

          <Tooltip numberOfLine={3} title={`Token price change \nin 24 hours`}>
            <Icon.InfoCircle />
          </Tooltip>
        </View>

        <SkeletonPlaceholder borderRadius={20} backgroundColor={color.gray_c100}>
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
    container: {
      ...atoms.flex_1,
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
      ...atoms.flex_1,
      minHeight: 112,
      marginVertical: 16,
      resizeMode: 'cover',
    },
  })
  return {styles, color} as const
}
