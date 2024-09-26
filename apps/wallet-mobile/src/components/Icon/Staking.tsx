import React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from './type'

export const Staking = ({size = 36, color = 'black'}: IconProps) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16C15.866 16 19 12.866 19 9ZM7 9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9C17 11.7614 14.7614 14 12 14C9.23858 14 7 11.7614 7 9Z"
      fill={color}
    />

    <Path
      d="M5.83203 15.5547C6.13839 15.0952 6.01421 14.4743 5.55468 14.168C5.09516 13.8616 4.47429 13.9858 4.16793 14.4453L2.17534 17.4342C2.12066 17.5137 2.0772 17.6016 2.04722 17.6955C2.00659 17.8223 1.99252 17.9543 2.00344 18.0836C2.01465 18.2189 2.0528 18.3466 2.11254 18.4613C2.1789 18.5893 2.2738 18.7044 2.39516 18.7964C2.48224 18.8627 2.58053 18.9149 2.68667 18.9499C2.79379 18.9853 2.90467 19.0017 3.01463 19H5.88192L7.09836 21.4329C7.13559 21.5106 7.18311 21.584 7.24048 21.6509C7.3238 21.7483 7.42382 21.827 7.53398 21.8849C7.66407 21.9536 7.80389 21.9909 7.94384 21.9986C8.2121 22.0134 8.48085 21.9198 8.68255 21.7311C8.74348 21.6743 8.79634 21.6106 8.84052 21.542L10.832 18.5547C11.1384 18.0952 11.0142 17.4743 10.5547 17.168C10.0952 16.8616 9.47429 16.9858 9.16793 17.4453L8.12377 19.0116L7.4049 17.5738C7.32424 17.4029 7.19656 17.2584 7.03854 17.1573C6.91479 17.078 6.77243 17.0253 6.61947 17.0071C6.57292 17.0014 6.52585 16.999 6.4786 17H4.86851L5.83203 15.5547Z"
      fill={color}
    />

    <Path
      d="M18.4453 14.168C17.9858 14.4743 17.8616 15.0952 18.1679 15.5547L19.1315 17H17.5223C17.4702 16.9989 17.4183 17.0018 17.3671 17.0087C17.2289 17.0271 17.0996 17.0737 16.9852 17.1425C16.8171 17.2436 16.6812 17.3928 16.5964 17.571L15.8762 19.0115L14.832 17.4453C14.5257 16.9858 13.9048 16.8616 13.4453 17.1679C12.9858 17.4743 12.8616 18.0952 13.1679 18.5547L15.1588 21.5409C15.2063 21.6151 15.2641 21.6834 15.3311 21.7437C15.4254 21.8286 15.5336 21.8933 15.6492 21.9365C15.7847 21.9875 15.9257 22.007 16.0634 21.9981C16.1997 21.9896 16.3356 21.9531 16.4624 21.8867C16.5737 21.8288 16.6747 21.7497 16.7588 21.6517C16.8166 21.5845 16.8644 21.5107 16.9018 21.4325L18.118 19H20.9853C21.0953 19.0017 21.2062 18.9853 21.3133 18.9499C21.4194 18.9149 21.5177 18.8626 21.6048 18.7964C21.7262 18.7044 21.8211 18.5893 21.8874 18.4613C21.9468 18.3474 21.9848 18.2206 21.9963 18.0863C22.0076 17.9561 21.9937 17.8232 21.9527 17.6955C21.9228 17.6016 21.8793 17.5138 21.8246 17.4342L19.832 14.4453C19.5257 13.9858 18.9048 13.8616 18.4453 14.168Z"
      fill={color}
    />
  </Svg>
)
