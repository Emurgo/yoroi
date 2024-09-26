import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Ledger = ({size = 24, color = '#4B6DDE'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.284 3.932L6.824 5.81a2 2 0 00-.766 2.776L13.07 20.43a2 2 0 002.579.788l3.398-1.614a2 2 0 00.877-2.803L12.972 4.694a2 2 0 00-2.688-.762z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 3A4.5 4.5 0 005 7.5V20a2 2 0 002 2h5a2 2 0 002-2V7.5A4.5 4.5 0 009.5 3zm0 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        fill="#C4CAD7"
      />
    </Svg>
  )
}
