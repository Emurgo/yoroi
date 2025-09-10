import * as React from 'react'
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg'

export const BanxaLogo = ({size = 48}: {size?: number}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M42.447 43H5.563a3.528 3.528 0 01-3.089-1.773 3.559 3.559 0 01.012-3.57L19.922 7.361a4.698 4.698 0 018.155 0l17.437 30.296a3.555 3.555 0 01-1.294 4.874 3.528 3.528 0 01-1.783.469h.01zm-30.725-7.122h24.576L24.01 14.523 11.722 35.878z"
        fill="url(#paint0_linear_18378_149218)"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear_18378_149218"
          x1={9.07941}
          y1={47.9877}
          x2={39.0412}
          y2={18.1214}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#0073D1" />

          <Stop offset={0.06} stopColor="#0082CE" />

          <Stop offset={0.22} stopColor="#00A0C9" />

          <Stop offset={0.39} stopColor="#00B8C4" />

          <Stop offset={0.57} stopColor="#00C9C1" />

          <Stop offset={0.76} stopColor="#00D3C0" />

          <Stop offset={1} stopColor="#00D6BF" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
