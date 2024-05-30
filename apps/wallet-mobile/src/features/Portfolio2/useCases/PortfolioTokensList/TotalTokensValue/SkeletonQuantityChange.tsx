import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const SkeletonQuantityChange = () => {
  const {color} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width={66} height={24} borderRadius={20} />
    </SkeletonPlaceholder>
  )
}
