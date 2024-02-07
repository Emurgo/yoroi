import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
}

export const ArrowRight = ({size}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L13.586 12 8.293 6.707a1 1 0 010-1.414z"
        fill="#000"
      />
    </Svg>
  )
}
