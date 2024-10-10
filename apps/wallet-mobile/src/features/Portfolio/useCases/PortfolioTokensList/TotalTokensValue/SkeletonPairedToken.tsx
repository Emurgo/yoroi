import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const SkeletonPairedToken = () => {
  const {color} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={color.gray_100}>
      <SkeletonPlaceholder.Item width={85} height={20} marginVertical={2} borderRadius={20} />
    </SkeletonPlaceholder>
  )
}
