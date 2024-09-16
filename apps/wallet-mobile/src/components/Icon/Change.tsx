import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  color?: string
}

export const Change = ({color = 'black'}: Props) => {
  return (
    <Svg width={20} height={14} fill="none">
      <Path
        fill={color}
        d="M4.707.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L3 3.414V11a3 3 0 003 3h4a1 1 0 100-2H6a1 1 0 01-1-1V3.414l1.293 1.293a1 1 0 001.414-1.414zm7.586 9a1 1 0 011.414 0L15 10.586V3a1 1 0 00-1-1h-4a1 1 0 110-2h4a3 3 0 013 3v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414"
      />
    </Svg>
  )
}
