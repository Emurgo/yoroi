import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const TokenBalanceSkeletonItem = () => {
  const {color} = useTheme()
  return (
    <SkeletonPlaceholder backgroundColor={color.gray_100}>
      <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between">
        <SkeletonPlaceholder.Item flexDirection="row">
          <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} marginRight={12} />

          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item width={47} height={16} borderRadius={20} marginBottom={4} />

            <SkeletonPlaceholder.Item width={64} height={20} borderRadius={20} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        <SkeletonPlaceholder.Item flexDirection="column" alignItems="flex-end">
          <SkeletonPlaceholder.Item width={99} height={16} borderRadius={20} marginBottom={6} />

          <SkeletonPlaceholder.Item width={74} height={14} borderRadius={20} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}
