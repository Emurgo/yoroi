import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {COLORS} from '../../theme'

type Props = {
  width: number
  height: number
  color?: string
}

export const Check = ({width, height, color}: Props) => (
  <Svg viewBox="0 0 24 24" {...{width, height}}>
    <Path
      fill={color != null ? color : COLORS.BLACK}
      d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
    />
  </Svg>
)
