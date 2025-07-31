import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const SkeletonQuantityChange = () => {
  const {palette: p} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={p.gray_100}>
      <SkeletonPlaceholder.Item width={66} height={24} borderRadius={20} />
    </SkeletonPlaceholder>
  )
}
