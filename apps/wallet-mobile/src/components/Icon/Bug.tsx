import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

import {IconProps} from '.'

export const Bug = ({size = 40, color = 'black'}: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="-2 -2 28 28">
      <Path
        d="M9.36572 9.75C9.98704 9.75 10.4907 9.24632 10.4907 8.625C10.4907 8.00368 9.98704 7.5 9.36572 7.5C8.7444 7.5 8.24072 8.00368 8.24072 8.625C8.24072 9.24632 8.7444 9.75 9.36572 9.75Z"
        fill={color}
      />

      <Path
        d="M14.6157 9.75C15.237 9.75 15.7407 9.24632 15.7407 8.625C15.7407 8.00368 15.237 7.5 14.6157 7.5C13.9944 7.5 13.4907 8.00368 13.4907 8.625C13.4907 9.24632 13.9944 9.75 14.6157 9.75Z"
        fill={color}
      />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.5 11H1.125C0.572715 11 0.125 11.4477 0.125 12C0.125 12.5523 0.572715 13 1.125 13H3.5V13.5C3.5 14.2143 3.5899 14.9192 3.76343 15.5998L1.75858 16.7594C1.28051 17.0359 1.11711 17.6477 1.39363 18.1257C1.67015 18.6038 2.28186 18.7672 2.75994 18.4907L4.49357 17.488C4.88564 18.226 5.38785 18.9087 5.98959 19.5104C7.58365 21.1045 9.74566 22 12 22C14.2543 22 16.4163 21.1045 18.0104 19.5104C18.6204 18.9004 19.1281 18.2072 19.5225 17.4575L21.1899 18.4219C21.668 18.6984 22.2797 18.535 22.5562 18.0569C22.8328 17.5789 22.6694 16.9671 22.1913 16.6906L20.2453 15.5651C20.4131 14.8953 20.5 14.2021 20.5 13.5V13H22.875C23.4273 13 23.875 12.5523 23.875 12C23.875 11.4477 23.4273 11 22.875 11H20.5V10.5C20.5 9.78571 20.4101 9.08069 20.2365 8.40007L22.2411 7.24065C22.7192 6.96413 22.8826 6.35241 22.606 5.87433C22.3295 5.39626 21.7178 5.23286 21.2397 5.50938L19.5064 6.51195C19.1143 5.77396 18.6121 5.09131 18.0104 4.48959C16.4163 2.89553 14.2543 2 12 2C9.74566 2 7.58365 2.89553 5.98959 4.48959C5.38783 5.09135 4.88562 5.77405 4.49355 6.51209L2.75994 5.50938C2.28186 5.23286 1.67015 5.39626 1.39363 5.87433C1.11711 6.35241 1.28051 6.96413 1.75858 7.24065L3.76341 8.40023C3.58989 9.0808 3.5 9.78577 3.5 10.5V11ZM7.40381 5.90381C8.62279 4.68482 10.2761 4 12 4C13.7239 4 15.3772 4.68482 16.5962 5.90381C17.8152 7.12279 18.5 8.77609 18.5 10.5V11H5.5V10.5C5.5 8.77609 6.18482 7.12279 7.40381 5.90381ZM18.1343 15.4993C18.1619 15.4518 18.1927 15.4073 18.2264 15.3661C18.4062 14.766 18.5 14.1378 18.5 13.5V13H13V19.9226C14.3536 19.7119 15.6155 19.0769 16.5962 18.0962C17.2023 17.4901 17.6764 16.7766 17.9998 16.0004C17.9996 15.8301 18.0429 15.6574 18.1343 15.4993ZM11 19.9226V13H5.5V13.5C5.5 15.2239 6.18482 16.8772 7.40381 18.0962C8.38454 19.0769 9.64641 19.7119 11 19.9226Z"
        fill={color}
      />
    </Svg>
  )
}
