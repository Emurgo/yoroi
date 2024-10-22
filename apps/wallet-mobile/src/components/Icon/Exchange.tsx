import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Exchange = ({size = 36, color = 'black'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 24" fill="none">
      <Path
        d="M12.5 22c3.976 0 8-1.374 8-4V6c0-2.626-4.024-4-8-4s-8 1.374-8 4v12c0 2.626 4.024 4 8 4zm0-2c-3.722 0-6-1.295-6-2v-1.268c1.541.838 3.777 1.268 6 1.268s4.459-.43 6-1.268V18c0 .705-2.278 2-6 2zm0-16c3.722 0 6 1.295 6 2 0 .705-2.278 2-6 2s-6-1.295-6-2c0-.705 2.278-2 6-2zm-6 4.732C8.041 9.57 10.277 10 12.5 10s4.459-.43 6-1.268V10c0 .705-2.278 2-6 2s-6-1.295-6-2V8.732zm0 4c1.541.838 3.777 1.268 6 1.268s4.459-.43 6-1.268V14c0 .705-2.278 2-6 2s-6-1.295-6-2v-1.268z"
        fill={color}
      />
    </Svg>
  )
}
