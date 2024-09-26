import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Wallet = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.05714 6C4.52218 6 4 6.47479 4 7.17223V16.8278C4 17.5252 4.52218 18 5.05714 18H18.9429C19.4721 18 20 17.5225 20 16.8278V7.17223C20 6.47747 19.4721 6 18.9429 6H5.05714ZM2 7.17223C2 5.48021 3.31074 4 5.05714 4H18.9429C20.6785 4 22 5.47754 22 7.17223V16.8278C22 18.5225 20.6785 20 18.9429 20H5.05714C3.31074 20 2 18.5198 2 16.8278V7.17223Z"
      fill={color}
    />
  </Svg>
)
