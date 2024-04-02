import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Backward = ({size = 24, color = '#383E54'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12.707 5.707a1 1 0 00-1.414-1.414l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414-1.414L7.414 13H19a1 1 0 100-2H7.414l5.293-5.293z"
      fill={color}
    />
  </Svg>
)
