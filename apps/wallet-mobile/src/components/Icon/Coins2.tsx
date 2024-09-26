import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Coins2 = ({size = 24, color = '#7C85A3'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 3a7 7 0 00-2.25 13.63c.8.907 1.83 1.604 3 2a7 7 0 107.5-11.261 7.009 7.009 0 00-3-2A6.983 6.983 0 009 3zm4.371 4.19a5 5 0 00-5.283 7.924 7.003 7.003 0 015.283-7.924zM5 12c0 .38.03.752.088 1.114a5 5 0 015.283-7.924A7.003 7.003 0 005 12zm15 2a5 5 0 11-10 0 5 5 0 0110 0z"
        fill={color}
      />
    </Svg>
  )
}
