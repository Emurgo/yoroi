import * as React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

type Props = {
  color?: string
  size?: number
}

export const Number4 = ({color = '#3154CB', size = 24}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_8313_223336)">
        <Rect width={24} height={24} rx={12} fill={color} />

        <Path
          d="M12.964 17a.324.324 0 01-.238-.098.324.324 0 01-.098-.238v-1.792H8.19a.341.341 0 01-.252-.098.353.353 0 01-.084-.238v-.952c0-.056.009-.121.028-.196a.662.662 0 01.126-.224l4.13-5.726c.12-.159.294-.238.518-.238h1.526c.093 0 .172.033.238.098a.324.324 0 01.098.238v5.684h1.246c.112 0 .196.033.252.098a.296.296 0 01.098.238v.98a.324.324 0 01-.098.238.324.324 0 01-.238.098h-1.26v1.792a.324.324 0 01-.098.238.324.324 0 01-.238.098h-1.218zM9.8 13.276h2.87V9.23L9.8 13.276z"
          fill="#fff"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_8313_223336">
          <Rect width={24} height={24} rx={12} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
