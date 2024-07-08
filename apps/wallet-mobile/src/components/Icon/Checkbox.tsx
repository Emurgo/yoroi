import * as React from 'react'
import Svg, {ClipPath, Defs, G, Path, Rect, SvgProps} from 'react-native-svg'

export const Checkbox = (props: SvgProps) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <G clipPath="url(#clip0_24683_1099)">
        <Rect width={16} height={16} rx={2} fill="#4B6DDE" />

        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.857 11L4 8.12l.806-.811L6.857 9.37 11.194 5l.806.818L6.857 11z"
          fill="#fff"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_24683_1099">
          <Rect width={16} height={16} rx={2} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
