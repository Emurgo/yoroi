import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

export const EyeOpen = (props: SvgProps) => {
  return (
    <Svg width={22} height={14} viewBox="0 0 22 14" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7a3 3 0 11-6 0 3 3 0 016 0zm-2 0a1 1 0 11-2 0 1 1 0 012 0z"
        fill="#4B6DDE"
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.052 6.684C1.072 6.617 3.367 0 11 0c7.633 0 9.927 6.617 9.949 6.684l.105.316-.106.316C20.927 7.383 18.633 14 11 14c-7.633 0-9.927-6.617-9.95-6.684L.947 7l.106-.316zM3.074 7c.502 1.154 2.575 5 7.926 5 5.348 0 7.422-3.842 7.926-5C18.424 5.846 16.35 2 11 2 5.652 2 3.578 5.842 3.074 7z"
        fill="#4B6DDE"
      />
    </Svg>
  )
}
