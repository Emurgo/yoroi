import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Collateral = ({size = 36, color = 'black'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.968 8.554L9 7.586l-.003.002a1.5 1.5 0 10-1.409 1.409L7.586 9l.968.968A3.981 3.981 0 008 12c0 .742.202 1.437.554 2.032L7.586 15l.002.003a1.5 1.5 0 101.41 1.41l.002.001.968-.968c.596.352 1.29.554 2.032.554s1.437-.202 2.032-.554l.968.968.003-.002a1.5 1.5 0 101.41-1.41l.001-.002-.968-.968c.352-.595.554-1.29.554-2.032a3.98 3.98 0 00-.554-2.032l.97-.97L16.5 9a1.5 1.5 0 10-1.498-1.417l-.97.97A3.981 3.981 0 0012 8c-.742 0-1.437.202-2.032.554zM10 12a2 2 0 114 0 2 2 0 01-4 0z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 2a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V5a3 3 0 00-3-3H5zM4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
        fill={color}
      />
    </Svg>
  )
}
