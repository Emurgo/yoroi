import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const HardwareWallet = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M7.06298 6.24902L10.5223 4.37111C11.2381 3.98253 12.1332 4.23617 12.5388 4.9425L19.4899 17.0491C19.9253 17.8074 19.6225 18.7758 18.8327 19.1509L15.4344 20.7651C14.7339 21.0978 13.8953 20.8417 13.5001 20.1744L6.4879 8.33154C6.05467 7.59984 6.31566 6.65471 7.06298 6.24902Z"
      fill={color}
      stroke="black"
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 3C7.01472 3 5 5.01472 5 7.5V20C5 21.1046 5.89543 22 7 22H12C13.1046 22 14 21.1046 14 20V7.5C14 5.01472 11.9853 3 9.5 3ZM9.5 10C10.8807 10 12 8.88071 12 7.5C12 6.11929 10.8807 5 9.5 5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10Z"
      fill="white"
    />
  </Svg>
)
