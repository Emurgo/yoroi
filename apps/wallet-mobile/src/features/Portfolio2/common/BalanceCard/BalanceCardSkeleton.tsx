import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const BalanceCardSkeleton = () => {
  const {color} = useStyles()
  return (
    <SkeletonPlaceholder borderRadius={9} backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width="100%" height={84} />
    </SkeletonPlaceholder>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  return {color} as const
}
