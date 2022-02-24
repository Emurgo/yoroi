import React from 'react'
import Svg, {G, Line, Path, Rect} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
  backgroundColor?: string
}

export const Megaphone = ({size = 40, color = 'black', backgroundColor = 'transparent'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G id="✅-REWAMP-1.1-(iOS)-current-implementation" fill="none" fillRule="evenodd">
      <Rect id="Rectangle" fill={backgroundColor} x="0" y="0" width="24" height="24" />

      <G id="icon" transform="translate(1.499824, 2.380088)" stroke={color} stroke-linejoin="round" strokeWidth="1.5">
        <Line x1="4.500176" y1="4.977456" x2="4.500176" y2="11.469216" id="Stroke-1" stroke-linecap="round" />
        <Line x1="21.469008" y1="8.777648" x2="20.589008" y2="8.777648" id="Stroke-2" stroke-linecap="round" />
        <Line x1="20.545624" y1="13.834216" x2="19.665624" y2="12.954216" id="Stroke-4" stroke-linecap="round" />
        <Line x1="20.545624" y1="3.72108" x2="19.665624" y2="4.60108" id="Stroke-6" stroke-linecap="round" />

        <Path d="M16.63464,0 L16.63464,16.44632 L16.56864,16.44632 C15.71944,16.44632 14.95912,15.9852 14.49448,15.27328 C11.9416,11.3608 7.62344,11.56584 7.62344,11.56584 L3.34224,11.56584 C1.496,11.56584 0,10.06896 0,8.2236 C0,6.37736 1.496,4.88136 3.34224,4.88136 L7.62344,4.88136 C7.62344,4.88136 11.9416,5.08552 14.49448,1.17216 C14.95912,0.46112 15.71944,0 16.56864,0 L16.63464,0 Z" />
        <Path
          d="M6.250176,18.5654 C5.28324562,18.5654 4.500176,17.9361466 4.500176,17.1611339 L4.500176,11.5654 L8.000176,11.5654 L8.000176,17.1611339 C8.000176,17.9361466 7.21710638,18.5654 6.250176,18.5654 Z"
          stroke-linecap="round"
        />
      </G>
    </G>
  </Svg>
)
