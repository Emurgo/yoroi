import React from 'react'
import Svg, {Circle, Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  fill?: string
}

export const CheckFilled2 = ({size = 20, color, fill}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20">
    <Circle cx={10} cy={10} r={10} fill={fill} />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.64 6.232a1 1 0 01.128 1.408l-5 6a1 1 0 01-1.475.067l-3-3a1 1 0 111.414-1.414l2.226 2.226 4.299-5.16a1 1 0 011.408-.127z"
      fill={color}
    />
  </Svg>
)
