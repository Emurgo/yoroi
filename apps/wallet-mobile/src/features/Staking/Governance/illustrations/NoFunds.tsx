import * as React from 'react'
import Svg, {Defs, LinearGradient, Path, Stop, SvgProps} from 'react-native-svg'

export const NoFunds = (props: SvgProps) => {
  return (
    <Svg width={255} height={192} viewBox="0 0 255 192" fill="none" {...props}>
      <Path
        d="M87.733 189.069l166.891-94.883M24.314 141.794l155.683-88.51M78.051 41.94l175.808 99.825M1.859 106.958l147.372 83.68"
        stroke="#DCE0E9"
        strokeWidth={0.5}
      />

      <Path
        d="M152.124 1.12l5.297 3.038-3.684 5.556.175 51.072c.022 6.58-3.936 14.242-8.856 17.11l-32.848 19.173a111.404 111.404 0 01-.609 4.633 25.332 25.332 0 01-1.459 5.418l1.536-1.217-1.465 6.58-6.669 11.67-5.516-3.29a1.49 1.49 0 01-.34-.198 1.428 1.428 0 01-.404-1.859 23.34 23.34 0 001.908-5.039c.639-2.319-.704-5.751-1.823-8.035l-11.962 6.982-4.761 7.178-6.063-3.181c-2.208-.893-3.673-3.526-3.673-7.474l-.18-52.975c-.022-6.581 3.936-14.242 8.855-17.11L144.8 1.087c1.842-1.08 3.559-1.327 4.986-.866.805.228 1.588.53 2.339.9z"
        fill="url(#paint0_linear_15646_35842)"
      />

      <Path
        d="M160.346 11.255c0-6.58-4.023-9.597-8.932-6.729l-65.216 38.07c-4.92 2.868-8.877 10.53-8.856 17.11l.18 52.97c0 6.58 4.024 9.597 8.933 6.729l20.144-11.758a18.15 18.15 0 01-1.126 9.844 60.893 60.893 0 01-2.383 4.765 1.466 1.466 0 00.286 1.765 1.457 1.457 0 001.775.171c4.701-3.071 11.25-8.999 12.731-18.75.263-1.727.465-3.29.618-4.743l33.171-19.364c4.92-2.868 8.877-10.53 8.856-17.11l-.181-52.97z"
        fill="#E8F4FF"
      />

      <Path
        d="M136.989 47.765c0 2.676 2.142 3.508 4.786 1.86 2.643-1.649 4.785-5.154 4.785-7.83 0-2.675-2.142-3.508-4.785-1.859-2.644 1.648-4.786 5.154-4.786 7.83z"
        fill="url(#paint1_linear_15646_35842)"
      />

      <Path
        d="M98.017 72.075c0 2.675 2.142 3.508 4.785 1.86 2.643-1.65 4.785-5.155 4.785-7.83 0-2.676-2.142-3.508-4.785-1.86-2.643 1.649-4.785 5.154-4.785 7.83z"
        fill="url(#paint2_linear_15646_35842)"
      />

      <Path
        d="M133.34 72.008l-19.358 12.075c-1.183.737-2.151.362-2.151-.836 0-1.197.968-2.781 2.151-3.519l19.358-12.074c1.182-.739 2.15-.362 2.15.836 0 1.197-.968 2.78-2.15 3.518z"
        fill="url(#paint3_linear_15646_35842)"
      />

      <Defs>
        <LinearGradient
          id="paint0_linear_15646_35842"
          x1={70.7276}
          y1={124.154}
          x2={157.421}
          y2={124.154}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset={0.15} stopColor="#1ACBAF" />

          <Stop offset={0.37} stopColor="#21B8BC" />

          <Stop offset={0.62} stopColor="#2E9BD3" />

          <Stop offset={0.89} stopColor="#3F71F1" />

          <Stop offset={1} stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint1_linear_15646_35842"
          x1={98.0167}
          y1={84.4609}
          x2={146.56}
          y2={84.4609}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset={0.15} stopColor="#1ACBAF" />

          <Stop offset={0.37} stopColor="#21B8BC" />

          <Stop offset={0.62} stopColor="#2E9BD3" />

          <Stop offset={0.89} stopColor="#3F71F1" />

          <Stop offset={1} stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint2_linear_15646_35842"
          x1={98.0167}
          y1={84.4609}
          x2={146.56}
          y2={84.4609}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset={0.15} stopColor="#1ACBAF" />

          <Stop offset={0.37} stopColor="#21B8BC" />

          <Stop offset={0.62} stopColor="#2E9BD3" />

          <Stop offset={0.89} stopColor="#3F71F1" />

          <Stop offset={1} stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint3_linear_15646_35842"
          x1={98.0167}
          y1={84.4609}
          x2={146.56}
          y2={84.4609}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset={0.15} stopColor="#1ACBAF" />

          <Stop offset={0.37} stopColor="#21B8BC" />

          <Stop offset={0.62} stopColor="#2E9BD3" />

          <Stop offset={0.89} stopColor="#3F71F1" />

          <Stop offset={1} stopColor="#475FFF" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
