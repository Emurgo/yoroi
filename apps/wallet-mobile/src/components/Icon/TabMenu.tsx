import React from 'react'
import Svg, {G, Path} from 'react-native-svg'

import {IconProps} from './type'

export const TabMenu = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size - 1} viewBox="0 0 25 24" fill="none">
    <G fill={color}>
      <Path d="M7.125 7a1 1 0 000 2h10a1 1 0 100-2h-10zM6.125 12a1 1 0 011-1h10a1 1 0 110 2h-10a1 1 0 01-1-1zM7.125 15a1 1 0 100 2h10a1 1 0 100-2h-10z" />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.125 2a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V5a3 3 0 00-3-3h-14zm-1 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1h-14a1 1 0 01-1-1V5z"
      />
    </G>
  </Svg>
)
