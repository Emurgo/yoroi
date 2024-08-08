import * as React from 'react'
import Svg, {Path, SvgProps} from 'react-native-svg'

type Props = SvgProps & {
  size?: number
}

export const Ledger = ({size = 24, ...props}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M10.284 3.932L6.824 5.81a2 2 0 00-.766 2.776L13.07 20.43a2 2 0 002.579.788l3.398-1.614a2 2 0 00.877-2.803L12.972 4.694a2 2 0 00-2.688-.762z"
        fill="#4B6DDE"
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 3A4.5 4.5 0 005 7.5V20a2 2 0 002 2h5a2 2 0 002-2V7.5A4.5 4.5 0 009.5 3zm0 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
        fill="#C4CAD7"
      />
    </Svg>
  )
}
