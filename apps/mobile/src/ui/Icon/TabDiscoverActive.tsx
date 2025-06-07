import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const TabDiscoverActive = ({size = 24, color = '#6B7384'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.375 12c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm14.707-4.707a1 1 0 01.249 1l-1.88 6.12a1 1 0 01-.662.663l-6.12 1.88a1 1 0 01-1.25-1.25l1.88-6.12a1 1 0 01.662-.662l6.12-1.88a1 1 0 011.001.249z"
        fill={color}
      />
    </Svg>
  )
}
