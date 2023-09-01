import React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

type Props = {size?: number; color?: string}

export const Swap = ({size = 42, color}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 42 41" fill="none">
    <G clipPath="url(#clip0_6637_7488)">
      <Path
        d="M26.207 10.293a1 1 0 10-1.414 1.414L27.086 14H17.5a1 1 0 100 2h9.586l-2.293 2.293a1 1 0 001.414 1.414l4-4a1 1 0 000-1.414l-4-4zM16.207 20.293a1 1 0 010 1.414L13.914 24H23.5a1 1 0 110 2h-9.586l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
        fill={color}
      />
    </G>

    <Defs>
      <ClipPath id="clip0_6637_7488">
        <Rect x={0.5} width={41} height={41} rx={20} fill={color} />
      </ClipPath>
    </Defs>
  </Svg>
)
