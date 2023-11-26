import Svg, {Defs, G, LinearGradient, Path, Stop} from 'react-native-svg'
import * as React from 'react'

export const SuccessTxImage = () => {
  return (
    <Svg width={255} height={192} viewBox="0 0 255 192" fill="none">
      <G opacity={0.2} stroke="#1D45BA" strokeWidth={0.5}>
        <Path d="M87.734 189.069l166.891-94.883M24.315 141.794l155.683-88.51M78.052 41.94l175.807 99.825M1.86 106.958l147.372 83.68" />
      </G>

      <Path
        d="M111.597 101.702c2.367-15.602 0-19.194 0-19.194l-15.53 20.839s4.154 6.668 3.121 10.419a23.338 23.338 0 01-1.907 5.04 1.428 1.428 0 00.404 1.859c.104.081.218.147.339.198l5.516 3.29 6.669-11.67 1.465-6.581-1.536 1.218a25.332 25.332 0 001.459-5.418z"
        fill="url(#paint0_linear_4077_133176)"
      />

      <Path
        d="M157.419 4.158l-5.297-3.038a13.847 13.847 0 00-2.339-.9c-1.427-.46-3.144-.213-4.986.867L79.581 39.152c-4.92 2.868-8.877 10.529-8.855 17.11l.18 52.975c0 3.948 1.465 6.581 3.674 7.474l6.062 3.181 4.761-7.178 59.651-34.818c4.92-2.868 8.878-10.53 8.856-17.11l-.175-51.072 3.684-5.556z"
        fill="url(#paint1_linear_4077_133176)"
      />

      <Path
        d="M160.344 11.255c0-6.58-4.023-9.597-8.932-6.729l-65.216 38.07c-4.92 2.868-8.877 10.53-8.856 17.11l.18 52.97c0 6.58 4.024 9.597 8.933 6.729l20.144-11.758a18.15 18.15 0 01-1.126 9.844 60.893 60.893 0 01-2.383 4.765 1.466 1.466 0 00.286 1.765 1.457 1.457 0 001.775.171c4.701-3.071 11.25-8.999 12.731-18.75.263-1.727.465-3.29.618-4.743l33.171-19.364c4.92-2.868 8.877-10.53 8.856-17.11l-.181-52.97z"
        fill="#E1F2FF"
      />

      <Path
        d="M121.362 39.178c-12.79 7.735-23.157 24.346-23.157 37.102 0 12.756 10.367 16.827 23.157 9.093 12.789-7.734 23.157-24.346 23.157-37.102 0-12.756-10.368-16.827-23.157-9.093z"
        fill="url(#paint2_linear_4077_133176)"
      />

      <Path
        d="M119.265 74.136l-6.052-4.604c-.713-.543-.813-1.749-.315-2.729.522-1.03 1.576-1.511 2.363-.912l4.583 3.486 9.53-21.517c.468-1.054 1.483-1.625 2.312-1.126.775.465.948 1.653.497 2.672l-10.49 23.682c-.224.509-.585.922-.994 1.13l-.04.02c-.476.234-.993.203-1.394-.102z"
        fill="#E1F2FF"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear_4077_133176"
          x1={96.0676}
          y1={124.151}
          x2={112.649}
          y2={124.151}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#3154CA" />

          <Stop offset={1} stopColor="#17D1AA" />
        </LinearGradient>

        <LinearGradient
          id="paint1_linear_4077_133176"
          x1={70.7253}
          y1={119.891}
          x2={157.419}
          y2={119.891}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#3154CA" />

          <Stop offset={1} stopColor="#17D1AA" />
        </LinearGradient>

        <LinearGradient
          id="paint2_linear_4077_133176"
          x1={140.859}
          y1={115.275}
          x2={172.191}
          y2={42.3571}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset={1} stopColor="#3154CB" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
