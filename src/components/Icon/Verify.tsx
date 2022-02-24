import React from 'react'
import Svg, {Circle, G, Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  backgroundColor?: string
}

export const Verify = ({size = 40, color = 'black', backgroundColor = 'transparent'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 20 20">
    <G transform="translate(-2.000000, -2.000000)">
      <Circle id="circle" fill={backgroundColor} stroke={color} strokeWidth="1.5" cx="12" cy="12" r="8.4" />
      <Path
        id="checkmark"
        fill={color}
        d="M14.5496566,9.318067 C14.8147882,8.97213714 15.3237662,8.89668542 15.6864909,9.14954087 C16.0129431,9.37711077 16.1096714,9.793051 15.9324717,10.1261462 L11.6942423,14.6819829 C11.4086229,15.0546442 10.8574102,15.1020565 10.5064081,14.8122174 L10.4075796,14.7151361 L8.16364969,12.3563433 C7.87931921,12.0245713 7.93083582,11.5357939 8.27871528,11.2646285 C8.58794146,11.0235925 9.02724406,11.0356306 9.32074364,11.2742955 L11.0010663,13.1002343 L14.5496566,9.318067 Z"
      />
    </G>
  </Svg>
)
