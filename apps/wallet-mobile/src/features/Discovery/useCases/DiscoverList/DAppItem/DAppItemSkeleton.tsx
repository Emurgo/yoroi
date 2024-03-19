import {useTheme} from '@yoroi/theme'
import React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const DAppItemSkeleton = () => {
  const {theme} = useTheme()

  return (
    <SkeletonPlaceholder backgroundColor={theme.color.gray[100]}>
      <SkeletonPlaceholder.Item flexDirection="row" width="100%" gap={16}>
        <SkeletonPlaceholder.Item width={48} height={48} borderRadius={8} />

        <SkeletonPlaceholder.Item flexDirection="column" gap={8} width="100%">
          <SkeletonPlaceholder.Item width={178} height={24} borderRadius={8} />

          <SkeletonPlaceholder.Item width="100%" maxWidth={283} height={32} borderRadius={8} />

          <SkeletonPlaceholder.Item width={54} height={24} borderRadius={8} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}
