import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import Svg, {Defs, LinearGradient, Path, Stop, SvgProps} from 'react-native-svg'

export const ThemeIlustration = (props: SvgProps) => {
  const {color} = useTheme()
  return (
    <Svg width="311" height="281" viewBox="0 0 311 281" fill="none" {...props}>
      <Path d="M311 183.04L140.117 280.6L0 200.034L170.214 101.933L311 183.04Z" fill={color.gray_200} />

      <Path d="M311 162.667L140.117 260.768L0 180.202L170.214 82.1008L311 162.667Z" fill={color.gray_100} />

      <Path d="M33.0635 76.8413L28.1599 79.1562L89.0673 114.188L93.9891 111.882L33.0635 76.8413Z" fill="#08C29D" />

      <Path d="M89.0873 143.394V114.147L28.1508 78.9382V108.185L89.0873 143.394Z" fill="#16E3BA" />

      <Path
        d="M55.1442 102.244C53.8109 101.473 52.1437 102.436 52.1437 103.975V104.501C52.1437 105.216 52.5246 105.876 53.1431 106.233L79.6104 121.525C80.9438 122.296 82.611 121.333 82.611 119.794V119.268C82.611 118.553 82.2301 117.893 81.6116 117.536L55.1442 102.244Z"
        fill="white"
      />

      <Path
        d="M52.1436 114.069C52.1436 114.784 52.5246 115.444 53.1431 115.801L79.6104 131.093C80.9437 131.864 82.611 130.902 82.611 129.362V128.836C82.611 128.122 82.23 127.462 81.6115 127.104L55.1442 111.812C53.8109 111.041 52.1436 112.004 52.1436 113.544V114.069Z"
        fill="white"
      />

      <Path
        d="M39.8692 90.9239C35.0476 88.1691 31.139 90.374 31.139 95.8494C31.139 101.325 35.0476 107.994 39.8692 110.749C44.6907 113.503 48.5994 111.298 48.5994 105.823C48.5994 100.348 44.6907 93.6788 39.8692 90.9239Z"
        fill="white"
      />

      <Path d="M89.0288 114.142V143.397L93.9378 140.12V111.836L89.0288 114.142Z" fill="#08C29D" />

      <Path d="M204 137L232 154.02L261 138L233 121L204 137Z" fill="#52FCFF" />

      <Path d="M204 137L204 171L232 187V154V153.917L204 137Z" fill="url(#paint0_linear_21228_66811)" />

      <Path d="M232 154V187L261 171V138L232 154Z" fill="url(#paint1_linear_21228_66811)" />

      <Path d="M121 211.151L140.515 223.014L160.727 211.848L141.212 200L121 211.151Z" fill="#52FCFF" />

      <Path d="M121 211.151L121 234.848L140.515 246V223V222.942L121 211.151Z" fill="url(#paint2_linear_21228_66811)" />

      <Path d="M140.515 223V246L160.727 234.848V211.848L140.515 223Z" fill="url(#paint3_linear_21228_66811)" />

      <Path d="M26 156.193L49.0877 170.227L73 157.017L49.9123 143L26 156.193Z" fill="#52FCFF" />

      <Path
        d="M26 156.193L26 184.228L49.0877 197.421V170.21V170.142L26 156.193Z"
        fill="url(#paint4_linear_21228_66811)"
      />

      <Path d="M49.0877 170.21V197.421L73 184.228V157.017L49.0877 170.21Z" fill="url(#paint5_linear_21228_66811)" />

      <Path
        d="M113.765 2.49437C111.051 0.931791 107.743 0.797381 104.911 2.13455C101.347 3.81739 99.1805 7.51469 99.4545 11.4467L109.285 152.497C109.578 156.691 111.739 160.531 115.173 162.957L182.081 210.231C184.567 211.987 187.699 212.561 190.646 211.8C195.221 210.618 198.416 206.489 198.412 201.764L198.271 59.2245C198.266 54.2215 195.592 49.6014 191.256 47.1053L113.765 2.49437Z"
        fill="#3154CB"
      />

      <Path
        d="M105.204 7.47445C102.535 5.93795 99.2041 7.86736 99.2087 10.947L99.4318 160.823C99.4339 162.257 100.203 163.579 101.447 164.29L182.12 210.388C184.787 211.912 188.106 209.985 188.104 206.913L188.03 57.4675C188.03 56.0373 187.265 54.7164 186.026 54.0029L105.204 7.47445Z"
        fill="#4B6DDE"
      />

      <Path
        d="M106.008 15.7426C104.673 14.9694 103.003 15.9338 103.005 17.4761L103.211 156.956C103.212 157.671 103.595 158.331 104.214 158.687L180.001 202.275C181.335 203.042 182.999 202.079 182.998 200.54L182.93 61.4663C182.93 60.7532 182.55 60.0943 181.933 59.7368L106.008 15.7426Z"
        fill="white"
      />

      <Path
        d="M133.006 43.3184C133.007 44.0351 133.391 44.6966 134.013 45.0522L150.358 54.3923C151.691 55.1543 153.35 54.1915 153.35 52.6559V51.8716C153.35 51.1562 152.968 50.4952 152.348 50.1383L136.002 40.7284C134.668 39.9603 133.003 40.9247 133.005 42.4644L133.006 43.3184Z"
        fill="#4B6DDE"
      />

      <Path
        d="M176.81 189.572L107.894 150.193L107.836 111.45L107.763 44.4998L176.766 82.4998L176.787 140.637L176.788 144.795L176.808 187.24L176.81 189.572Z"
        fill="#EAEDF2"
      />

      <Path
        d="M146.185 84.5331C145.599 84.6212 145.013 84.6873 144.426 84.7534C143.84 84.8194 143.254 84.8855 142.668 84.9736C142.5 84.9736 142.416 84.9736 142.249 84.7093C140.825 82.771 139.401 80.9207 137.893 78.9824L133.371 72.9031C133.1 72.5552 132.84 72.2072 132.583 71.8634C132.125 71.2494 131.676 70.6485 131.193 70.0837L126 67C126.251 67.3524 126.503 67.7048 126.754 67.9692C127.164 68.5081 127.574 69.0554 127.986 69.6058C128.921 70.8548 129.87 72.1206 130.858 73.3436C131.528 74.2247 132.198 75.1278 132.868 76.0309C133.538 76.9339 134.208 77.837 134.878 78.7181L138.647 83.7401C139.234 84.5331 139.841 85.3261 140.448 86.119C141.055 86.9119 141.663 87.705 142.249 88.4979C142.416 88.6741 142.5 88.7622 142.584 88.6741C143.589 88.586 144.51 88.4979 145.515 88.3217C146.73 88.1895 147.923 88.0353 149.117 87.8811C150.31 87.7269 151.504 87.5728 152.718 87.4406C153.654 87.3468 154.59 87.2281 155.513 87.111C156.325 87.0081 157.127 86.9063 157.911 86.8239C158.246 86.8239 158.665 86.7357 159 86.6476L153.807 83.4758C152.062 83.7818 150.317 84.0027 148.544 84.2273C147.764 84.326 146.978 84.4255 146.185 84.5331Z"
        fill="#4B6DDE"
      />

      <Path
        d="M151.546 105.767L148.949 106.119C145.725 101.846 142.521 97.5947 139.317 93.3435C136.113 89.0925 132.91 84.8415 129.685 80.5684V76.7799L129.687 76.782C136.973 86.4729 144.259 96.1639 151.546 105.767Z"
        fill="#4B6DDE"
      />

      <Path
        d="M139.621 99.2624C136.314 94.8605 133.017 90.4716 129.685 86.1189V89.9075C131.572 92.3986 133.46 94.9078 135.355 97.4258C137.748 100.607 140.153 103.803 142.584 107L145.18 106.648C143.319 104.185 141.468 101.721 139.621 99.2624Z"
        fill="#4B6DDE"
      />

      <Path
        d="M155.398 92.1983C153.807 92.4185 152.216 92.6168 150.624 92.815C149.033 93.0133 147.442 93.2115 145.85 93.4318C145.934 93.5199 145.934 93.608 145.934 93.608C146.353 94.1366 146.751 94.6873 147.148 95.2379C147.546 95.7886 147.944 96.3393 148.363 96.8679L148.447 96.956C149.619 96.8238 150.771 96.6697 151.923 96.5155C153.074 96.3613 154.226 96.2071 155.398 96.0749V92.1983Z"
        fill="#4B6DDE"
      />

      <Path
        d="M155.398 101.626C154.854 101.714 154.331 101.78 153.807 101.846C153.284 101.912 152.76 101.978 152.216 102.066C152.634 102.638 153.052 103.188 153.471 103.739C153.89 104.289 154.31 104.841 154.728 105.414L155.398 105.326V101.626Z"
        fill="#4B6DDE"
      />

      <Path
        d="M176.81 189.571L107.894 150.192L107.894 126.5L131.5 112L147 147.5L162 141.5L176.788 165L176.81 189.571Z"
        fill="#C4CAD7"
      />

      <Path d="M160.412 11.156L155.509 13.4709L216.416 48.5031L221.338 46.1972L160.412 11.156Z" fill="#08C29D" />

      <Path d="M216.437 77.7089V48.4622L155.5 13.2534V42.5L216.437 77.7089Z" fill="#16E3BA" />

      <Path
        d="M182.494 36.5584C181.16 35.788 179.493 36.7502 179.493 38.2901V38.8159C179.493 39.5302 179.874 40.1903 180.493 40.5476L206.96 55.84C208.293 56.6104 209.961 55.6482 209.961 54.1083V53.5825C209.961 52.8682 209.58 52.2081 208.961 51.8508L182.494 36.5584Z"
        fill="white"
      />

      <Path
        d="M179.493 48.384C179.493 49.0983 179.874 49.7584 180.493 50.1157L206.96 65.4081C208.293 66.1785 209.961 65.2163 209.961 63.6764V63.1506C209.961 62.4363 209.58 61.7762 208.961 61.4189L182.494 46.1265C181.161 45.3561 179.493 46.3183 179.493 47.8582V48.384Z"
        fill="white"
      />

      <Path
        d="M167.218 25.2389C162.397 22.484 158.488 24.689 158.488 30.1644C158.488 35.6398 162.397 42.3087 167.218 45.0635C172.04 47.8184 175.949 45.6134 175.949 40.138C175.949 34.6626 172.04 27.9937 167.218 25.2389Z"
        fill="white"
      />

      <Path d="M216.378 48.4563V77.7119L221.287 74.4343V46.1504L216.378 48.4563Z" fill="#08C29D" />

      <Defs>
        <LinearGradient
          id="paint0_linear_21228_66811"
          x1="221.07"
          y1="137"
          x2="192.036"
          y2="159.842"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint1_linear_21228_66811"
          x1="232"
          y1="187"
          x2="261"
          y2="187"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint2_linear_21228_66811"
          x1="132.897"
          y1="211.151"
          x2="112.662"
          y2="227.071"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint3_linear_21228_66811"
          x1="140.515"
          y1="246"
          x2="160.727"
          y2="246"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint4_linear_21228_66811"
          x1="40.0751"
          y1="156.193"
          x2="16.135"
          y2="175.027"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>

        <LinearGradient
          id="paint5_linear_21228_66811"
          x1="49.0877"
          y1="197.421"
          x2="73"
          y2="197.421"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#17D1AA" />

          <Stop offset="0.15" stopColor="#1ACBAF" />

          <Stop offset="0.37" stopColor="#21B8BC" />

          <Stop offset="0.62" stopColor="#2E9BD3" />

          <Stop offset="0.89" stopColor="#3F71F1" />

          <Stop offset="1" stopColor="#475FFF" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
