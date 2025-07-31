import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const SkeletonPrimaryToken = () => {
  const {palette: p} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={p.gray_100}>
      <SkeletonPlaceholder.Item
        width={108}
        height={28}
        marginVertical={4}
        borderRadius={20}
      />
    </SkeletonPlaceholder>
  )
}
