import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Danger = ({size = 36, color = '#000000'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50" fill="none">
      <Path
        d="M25 31.25a2.083 2.083 0 000 4.167h.02a2.083 2.083 0 000-4.167H25zM25 14.584c-1.15 0-2.083.932-2.083 2.083v10.417a2.083 2.083 0 104.166 0V16.667c0-1.15-.932-2.083-2.083-2.083z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.167 25C4.167 13.494 13.494 4.167 25 4.167c11.506 0 20.833 9.327 20.833 20.833 0 11.506-9.327 20.834-20.833 20.834-11.506 0-20.833-9.328-20.833-20.834zM25 8.334C15.795 8.334 8.333 15.796 8.333 25c0 9.205 7.462 16.667 16.667 16.667 9.205 0 16.667-7.462 16.667-16.667 0-9.204-7.462-16.666-16.667-16.666z"
        fill={color}
      />
    </Svg>
  )
}
