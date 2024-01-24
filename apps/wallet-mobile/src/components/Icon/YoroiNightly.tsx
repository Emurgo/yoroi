import React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const YoroiNightly = ({size = 36, color = 'black'}: Props) => (
  <Svg width={size} height={size} viewBox="-2 -2 28 28">
    <Path
      d="M21.4376 16.0369C21.5294 16.0559 21.6134 16.1019 21.6788 16.169C21.7434 16.2373 21.7859 16.3235 21.8009 16.4163C21.816 16.5091 21.8028 16.6043 21.7631 16.6895C21.0174 18.2978 19.8905 19.6996 18.4802 20.7732C17.07 21.8469 15.419 22.5598 13.6707 22.85C11.9224 23.1403 10.1297 22.9991 8.44832 22.4388C6.76696 21.8785 5.2478 20.9159 4.0228 19.6348C2.7978 18.3537 1.90402 16.7927 1.41911 15.0875C0.934202 13.3823 0.872828 11.5845 1.24032 9.85017C1.60781 8.11586 2.39306 6.49754 3.52784 5.1358C4.66262 3.77406 6.1126 2.71009 7.75183 2.03633C7.83918 1.99933 7.93571 1.98975 8.02863 2.00886C8.12154 2.02797 8.20646 2.07487 8.27213 2.14334C8.33781 2.21182 8.38113 2.29863 8.39638 2.39229C8.41162 2.48595 8.39806 2.58204 8.35749 2.66781C7.51042 4.4833 7.23133 6.51242 7.55677 8.4893C7.88222 10.4662 8.79702 12.2986 10.1813 13.7465C11.5656 15.1944 13.3549 16.1902 15.3146 16.6034C17.2743 17.0166 19.3131 16.828 21.1638 16.0623C21.2505 16.0267 21.3459 16.0179 21.4376 16.0369Z"
      fill={color}
    />

    <Path d="M18.594 15.0713L19.735 14.2808L10.2193 7.70041V9.28018L18.594 15.0713Z" fill={color} />

    <Path
      d="M16.6363 7.32333C16.8903 7.15159 17.1444 6.97985 17.3976 6.80652C18.5087 6.04276 19.6202 5.27937 20.732 4.51633H23L22.5223 4.847L20.2479 6.40651C19.2072 7.12404 18.1647 7.84014 17.1204 8.55483C16.8022 8.77323 16.484 8.98858 16.1635 9.20549C16.0597 9.27569 15.9558 9.34604 15.8515 9.41672C15.8305 9.43583 15.8031 9.44642 15.7747 9.44642C15.7463 9.44642 15.719 9.43583 15.698 9.41672C15.3887 9.20159 15.0786 8.98797 14.7685 8.77429C14.5558 8.62773 14.3431 8.48114 14.1305 8.33402L10.7332 5.96703L8.96424 4.73926L8.64435 4.51526H10.9038L11.8369 5.16488C12.0914 5.34203 12.3456 5.51951 12.5997 5.69694C13.0036 5.97888 13.4072 6.2607 13.8117 6.54091C14.0864 6.73147 14.3617 6.9212 14.6371 7.11093C14.989 7.35345 15.341 7.59596 15.6916 7.84014C15.7166 7.86316 15.7493 7.87593 15.7833 7.87593C15.8172 7.87593 15.85 7.86316 15.875 7.84014C16.1282 7.66681 16.3823 7.49507 16.6363 7.32333Z"
      fill={color}
    />

    <Path
      d="M17.2409 10.5837L21.3995 7.70361L21.4037 9.27165C21.4018 9.28163 21.3986 9.29132 21.3942 9.30045L18.3808 11.3869C18.367 11.3885 18.3532 11.3855 18.3413 11.3784C17.9884 11.1309 17.6365 10.8813 17.2857 10.6317C17.2695 10.6169 17.2546 10.6008 17.2409 10.5837Z"
      fill={color}
    />

    <Path d="M20.0133 12.5731L21.3995 11.613L21.4027 13.1267L21.0945 13.34L20.0133 12.5731Z" fill={color} />
  </Svg>
)
