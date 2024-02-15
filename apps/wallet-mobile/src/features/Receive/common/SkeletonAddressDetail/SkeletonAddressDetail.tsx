import {useTheme} from '@yoroi/theme'
import React from 'react'
import {useWindowDimensions} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const SkeletonAdressDetail = () => {
  const {width} = useWindowDimensions()
  const {theme} = useTheme()
  const WIDTH = width - 32

  return (
    <SkeletonPlaceholder borderRadius={10} backgroundColor={theme.color.gray[200]}>
      <SkeletonPlaceholder.Item alignItems="center" justifyContent="center">
        <SkeletonPlaceholder.Item width={WIDTH} height="100%" maxHeight={458} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}

export const SkeletonSmallCardAddress = () => {
  const {width} = useWindowDimensions()
  const {theme} = useTheme()
  const WIDTH = width - 32

  return (
    <SkeletonPlaceholder borderRadius={10} backgroundColor={theme.color.gray[200]}>
      <SkeletonPlaceholder.Item alignItems="center" justifyContent="center">
        <SkeletonPlaceholder.Item width={WIDTH} height={140} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  )
}
