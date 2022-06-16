import React from 'react'
import {ImageStyle} from 'react-native'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  style?: ImageStyle
}

export const Cross = ({size = 36, color = 'black', style = {}}: Props) => (
  <Svg width={size} height={size} {...style} viewBox="-2 -2 28 28">
    <Path
      d="M19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711Z"
      fill={color}
    />
  </Svg>
)
