import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const LockFilled = ({size = 16, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 7V5.778C4 4.75 4.442 3.78 5.2 3.08A4.126 4.126 0 018 2c1.037 0 2.046.38 2.8 1.08.758.701 1.2 1.67 1.2 2.698V7h.667C13.403 7 14 7.57 14 8.273v4.454C14 13.43 13.403 14 12.667 14H3.333C2.597 14 2 13.43 2 12.727V8.273C2 7.57 2.597 7 3.333 7H4zm2.558-2.453C6.928 4.205 7.446 4 8 4c.554 0 1.072.205 1.442.547.368.34.558.785.558 1.23V7H6V5.778c0-.446.19-.89.558-1.23z"
      fill={color}
    />
  </Svg>
)
