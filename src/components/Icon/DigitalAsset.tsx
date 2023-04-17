import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const DigitalAsset = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M6 7C6 6.44772 6.44772 6 7 6H9C9.55228 6 10 6.44772 10 7V10H11C11.5523 10 12 10.4477 12 11C12 11.5523 11.5523 12 11 12H7C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10H8V8H7C6.44772 8 6 7.55228 6 7Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 11C13.4477 11 13 11.4477 13 12V17C13 17.5523 13.4477 18 14 18H17C17.5523 18 18 17.5523 18 17V12C18 11.4477 17.5523 11 17 11H14ZM15 16V13H16V16H15Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5ZM5 4C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H5Z"
      fill={color}
    />
  </Svg>
)
