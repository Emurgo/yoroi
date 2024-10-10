import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const CheckFilled2 = ({size = 20, color}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20">
    <Path
      d="M14.707 8.707a1 1 0 00-1.414-1.414L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l5-5z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10zm10-8a8 8 0 100 16 8 8 0 000-16z"
      fill={color}
    />
  </Svg>
)
