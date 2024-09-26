import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const TabPortfolioActive = ({size = 24, color = '#6B7384'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
      <Path
        d="M10.625 3h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1zm10 10h-6a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-6a1 1 0 00-1-1zm-3-10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm-10 10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z"
        fill={color}
      />
    </Svg>
  )
}
