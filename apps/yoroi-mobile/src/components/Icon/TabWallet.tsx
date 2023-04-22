import React from 'react'
import Svg, {G, Path} from 'react-native-svg'

type Props = {size?: number; color?: string}

export const TabWallet = ({size = 24, color = '#6B7384'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <G>
        <G id="icon" transform="translate(1.999583, 4.500000)" stroke={color} strokeWidth="2">
          <Path d="M20,2.32738557 L20,12.6726144 C20,13.9526765 18.9725714,15 17.7142857,15 L2.28571429,15 C1.01828571,15 0,13.9526765 0,12.6726144 L0,2.32738557 C0,1.04732351 1.01828571,0 2.28571429,0 L17.7142857,0 C18.9725714,0 20,1.04732351 20,2.32738557 Z" />
        </G>
      </G>
    </G>
  </Svg>
)
