import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Check = ({size = 40, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.707 5.293a1 1 0 010 1.414L17.5 9.914 10.414 17l-.707.707a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 15.586l2-2 5-5 3.293-3.293a1 1 0 011.414 0z"
      fill={color}
    />
  </Svg>
)
