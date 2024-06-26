import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {size: number; color?: string}

export const AngleUp = ({size, color}: Props) => (
  <Svg viewBox="0 0 16 16" width={size} height={size}>
    <Path
      fill={color != null ? color : '#12705D'}
      d="M4.30077 8.89366C3.92359 9.32471 4.22971 9.99932 4.80249 9.99932H11.1975C11.7702 9.99932 12.0764 9.32471 11.6992 8.89365L8.50169 5.23938C8.23608 4.93583 7.76386 4.93583 7.49826 5.23938L4.30077 8.89366Z"
    />
  </Svg>
)
