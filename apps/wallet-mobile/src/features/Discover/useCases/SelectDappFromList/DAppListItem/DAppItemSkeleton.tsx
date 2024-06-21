import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const DAppItemSkeleton = () => {
  const {color} = useTheme()

  return (
    <SkeletonPlaceholder backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item flexDirection="row" width="100%" gap={12} alignItems="flex-start">
        <SkeletonPlaceholder.Item width={48} height={48} borderRadius={8} />

        <SkeletonPlaceholder.Item flexDirection="column" flex={1} justifyContent="flex-start" alignItems="flex-start">
          <SkeletonPlaceholder.Item width={178} height={24} borderRadius={8} marginBottom={4} />

          <SkeletonPlaceholder.Item width="100%" maxWidth={283} height={32} borderRadius={8} marginBottom={8} />

          <SkeletonPlaceholder.Item width={54} height={24} borderRadius={8} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}

export const DAppTabSkeleton = () => {
  const {color} = useTheme()

  return (
    <SkeletonPlaceholder backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width="100%" maxWidth={343} height={40} borderRadius={8} />
    </SkeletonPlaceholder>
  )
}

export const DAppCountConnectedSkeleton = () => {
  const {color} = useTheme()

  return (
    <SkeletonPlaceholder backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width={125} height={22} borderRadius={8} />
    </SkeletonPlaceholder>
  )
}
