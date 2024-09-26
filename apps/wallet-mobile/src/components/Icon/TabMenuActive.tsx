import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const TabMenuActive = ({size = 24, color = '#6B7384'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.125 2a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V5a3 3 0 00-3-3h-14zm2 5a1 1 0 000 2h10a1 1 0 100-2h-10zm0 4a1 1 0 100 2h10a1 1 0 100-2h-10zm-1 5a1 1 0 011-1h10a1 1 0 110 2h-10a1 1 0 01-1-1z"
        fill={color}
      />
    </Svg>
  )
}
