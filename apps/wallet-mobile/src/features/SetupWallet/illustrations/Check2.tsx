import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  color?: string
}

export const Check2 = ({color = '#08C29D'}: Props) => {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.065.496a4 4 0 015.302 1.348 4 4 0 014.777 4.778 4 4 0 01.012 6.745 4 4 0 01-4.778 4.777A3.999 3.999 0 0110 20a4 4 0 01-3.344-1.856 3.999 3.999 0 01-3.723-1.066 4 4 0 01-1.055-3.69A4 4 0 010 10a4 4 0 011.878-3.378 4 4 0 011.044-3.689 4 4 0 012.69-1.177 4 4 0 011 .11A4 4 0 018.064.497zm5.642 6.797a1 1 0 010 1.414l-4 4a1.001 1.001 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 0z"
        fill={color}
      />
    </Svg>
  )
}
