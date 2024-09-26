import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Edit = ({size = 40, color = 'black'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M17.8937 2C17.0699 2 16.2798 2.32727 15.6973 2.90981L3.28583 15.3212C3.15767 15.4494 3.06675 15.61 3.02279 15.7858L2.02988 19.7575C1.94468 20.0982 2.04453 20.4587 2.29291 20.7071C2.54129 20.9555 2.90178 21.0553 3.24256 20.9701L7.21421 19.9772C7.39005 19.9333 7.55063 19.8424 7.67878 19.7142L20.0902 7.30277C20.3787 7.01432 20.6075 6.67189 20.7636 6.29501C20.9197 5.91814 21 5.51421 21 5.10629C21 4.69836 20.9197 4.29444 20.7636 3.91756C20.6075 3.54069 20.3787 3.19826 20.0902 2.90981C19.8018 2.62137 19.4593 2.39256 19.0825 2.23645C18.7056 2.08035 18.3017 2 17.8937 2ZM17.1115 4.32402C17.3189 4.11656 17.6003 4 17.8937 4C18.039 4 18.1829 4.02861 18.3171 4.08421C18.4513 4.13981 18.5733 4.2213 18.676 4.32402C18.7787 4.42675 18.8602 4.54871 18.9158 4.68293C18.9714 4.81715 19 4.96101 19 5.10629C19 5.25157 18.9714 5.39543 18.9158 5.52965C18.8602 5.66387 18.7787 5.78582 18.676 5.88855L6.46043 18.1041L4.37439 18.6256L4.8959 16.5396L17.1115 4.32402Z"
        fill={color}
      />

      <Path
        d="M12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21H21C21.5523 21 22 20.5523 22 20C22 19.4477 21.5523 19 21 19H12Z"
        fill={color}
      />
    </Svg>
  )
}
