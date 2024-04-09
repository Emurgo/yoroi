import {useTheme} from '@yoroi/theme'
import React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const DAppItemSkeleton = () => {
  const {theme} = useTheme()

  return (
    <SkeletonPlaceholder backgroundColor={theme.color.gray[100]}>
      <SkeletonPlaceholder.Item flexDirection="row" width="100%" gap={12}>
        <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} />

        <SkeletonPlaceholder.Item flexDirection="column" width="100%" gap={8}>
          <SkeletonPlaceholder.Item width={178} height={20} borderRadius={8} />

          <SkeletonPlaceholder.Item width="100%" maxWidth={283} height={28} borderRadius={8} />

          <SkeletonPlaceholder.Item width={54} height={20} borderRadius={8} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}
