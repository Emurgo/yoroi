import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const DAppTokenItemSkeleton = () => {
  const {color} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={color.gray_100}>
      <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" justifyContent="space-between">
        <SkeletonPlaceholder.Item flexDirection="row" gap={12} alignItems="center">
          <SkeletonPlaceholder.Item width={40} height={40} position="relative">
            <SkeletonPlaceholder.Item width={26} height={26} position="absolute" top={0} left={0} borderRadius={8} />

            <SkeletonPlaceholder.Item
              width={26}
              height={26}
              position="absolute"
              bottom={0}
              right={0}
              borderRadius={8}
            />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="column" gap={6}>
            <SkeletonPlaceholder.Item width={87} height={24} borderRadius={20} />

            <SkeletonPlaceholder.Item width={50} height={14} borderRadius={20} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection="column" alignItems="flex-end">
          <SkeletonPlaceholder.Item width={74} height={16} borderRadius={20} marginBottom={6} />

          <SkeletonPlaceholder.Item width={50} height={14} borderRadius={20} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}
