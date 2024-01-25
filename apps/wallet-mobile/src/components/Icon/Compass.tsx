import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Compass = ({size = 36, color = 'black'}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.33 6.294a1 1 0 00-1.249-1.25l-6.12 1.88a1 1 0 00-.662.662l-1.88 6.12a1 1 0 001.25 1.25l6.12-1.88a1 1 0 00.662-.662l1.88-6.12zM7.886 12.49l1.17-3.81 3.81-1.17-1.17 3.81-3.81 1.17z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.375 0c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-8 10a8 8 0 1116 0 8 8 0 01-16 0z"
        fill={color}
      />
    </Svg>
  )
}
