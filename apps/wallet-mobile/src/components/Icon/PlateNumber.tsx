import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const PlateNumber = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.8 6C4.58397 6 4 6.34014 4 7.33333V16.6667C4 17.6599 4.58397 18 4.8 18H19.2C19.416 18 20 17.6599 20 16.6667V7.33333C20 6.34014 19.416 6 19.2 6H4.8ZM2 7.33333C2 5.74919 3.0278 4 4.8 4H19.2C20.9722 4 22 5.74919 22 7.33333V16.6667C22 18.2508 20.9722 20 19.2 20H4.8C3.0278 20 2 18.2508 2 16.6667V7.33333Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 14C6 13.4477 6.44772 13 7 13H13C13.5523 13 14 13.4477 14 14C14 14.5523 13.5523 15 13 15H7C6.44772 15 6 14.5523 6 14Z"
      fill={color}
    />

    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 10C6 9.44772 6.44772 9 7 9H17C17.5523 9 18 9.44772 18 10C18 10.5523 17.5523 11 17 11H7C6.44772 11 6 10.5523 6 10Z"
      fill={color}
    />
  </Svg>
)
