import * as React from 'react'
import Svg, {G, Path} from 'react-native-svg'

import {IconProps} from '.'

export const Language = ({size = 24, color = '#6B7384'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G fill={color}>
        <Path d="M8 2a1 1 0 011 1v2h4.002a.997.997 0 01.995.921.997.997 0 01-.19.67l-.002.002-.022.032a28.803 28.803 0 01-.41.558c-.278.373-.675.897-1.15 1.5a52.525 52.525 0 01-2.82 3.305l1.304 1.305a1 1 0 01-1.414 1.414l-1.306-1.306c-.972.898-1.778 1.492-2.388 1.88-.377.24-.677.4-.894.504a4.552 4.552 0 01-.342.147l-.028.01-.01.004-.005.001-.002.001a1 1 0 11-.623-1.902c.026-.01.076-.031.147-.065.143-.069.373-.19.684-.387.49-.313 1.183-.817 2.045-1.609L4.293 9.707a1 1 0 011.414-1.414l2.28 2.28a50.853 50.853 0 002.666-3.13L10.999 7H3a1 1 0 010-2h4V3a1 1 0 011-1z" />

        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 10a1 1 0 01.894.553l2.99 5.98a.957.957 0 01.02.04l1.99 3.98a1 1 0 11-1.788.894L18.381 18h-4.764l-1.724 3.447a1 1 0 11-1.789-.894l1.991-3.982a.73.73 0 01.018-.035l2.991-5.983A1 1 0 0116 10zm0 3.236L17.382 16h-2.764L16 13.236z"
        />
      </G>
    </Svg>
  )
}
