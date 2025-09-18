import {SpacingSize, atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {Space} from '~/ui/Space/Space'

export const Divider = ({
  verticalSpace = 'xs',
}: {
  verticalSpace?: SpacingSize
}) => {
  const {palette: p} = useTheme()

  const SpaceComponent = React.useMemo(() => {
    switch (verticalSpace) {
      case '_2xs':
        return Space.Height._2xs
      case 'xs':
        return Space.Height.xs
      case 'sm':
        return Space.Height.sm
      case 'md':
        return Space.Height.md
      case 'lg':
        return Space.Height.lg
      case 'xl':
        return Space.Height.xl
      case '_2xl':
        return Space.Height._2xl
      default:
        return Space.Height.xs
    }
  }, [verticalSpace])

  return (
    <>
      <SpaceComponent />

      <View
        style={[{height: 1}, a.align_stretch, {backgroundColor: p.gray_200}]}
      />

      <SpaceComponent />
    </>
  )
}
