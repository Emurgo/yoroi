import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {size?: number; color?: string}

export const Exchange = ({size = 36, color = 'black'}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 17 20">
      <Path
        d="M8.5 20C12.476 20 16.5 18.626 16.5 16V4C16.5 1.374 12.476 0 8.5 0C4.524 0 0.5 1.374 0.5 4V16C0.5 18.626 4.524 20 8.5 20ZM8.5 18C4.778 18 2.5 16.705 2.5 16V14.732C4.041 15.57 6.277 16 8.5 16C10.723 16 12.959 15.57 14.5 14.732V16C14.5 16.705 12.222 18 8.5 18ZM8.5 2C12.222 2 14.5 3.295 14.5 4C14.5 4.705 12.222 6 8.5 6C4.778 6 2.5 4.705 2.5 4C2.5 3.295 4.778 2 8.5 2ZM2.5 6.732C4.041 7.57 6.277 8 8.5 8C10.723 8 12.959 7.57 14.5 6.732V8C14.5 8.705 12.222 10 8.5 10C4.778 10 2.5 8.705 2.5 8V6.732ZM2.5 10.732C4.041 11.57 6.277 12 8.5 12C10.723 12 12.959 11.57 14.5 10.732V12C14.5 12.705 12.222 14 8.5 14C4.778 14 2.5 12.705 2.5 12V10.732Z"
        fill={color}
      />
    </Svg>
  )
}

export default Exchange
