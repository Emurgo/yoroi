import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

type Props = {
  cardHeight?: number
}
export const BalanceCardSkeleton = ({cardHeight = 84}: Props) => {
  const {color} = useStyles()
  return (
    <SkeletonPlaceholder borderRadius={9} backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width="100%" height={cardHeight} />
    </SkeletonPlaceholder>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  return {color} as const
}
