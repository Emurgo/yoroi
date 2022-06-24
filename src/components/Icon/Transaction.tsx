import React from 'react'
import Svg, {G, Path, Rect} from 'react-native-svg'

type Props = {
  size?: number
  color?: string
}

export const Transaction = ({size = 36, color = '#6B7384'}: Props) => (
  <Svg viewBox="0 0 30 30" width={size} height={size}>
    <G stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <G transform="translate(6.000000, 6.000000)">
        <Rect x="0" y="0" width="18" height="18" />
        <G transform="translate(1.500000, 1.500000)" fill={color} fill-rule="nonzero">
          <Path d="M7.64655,0.00015 C11.869835,0.00015 15.29355,3.42361465 15.29355,7.6464 C15.29355,7.95706017 15.0417102,8.2089 14.73105,8.2089 C14.4203898,8.2089 14.16855,7.95706017 14.16855,7.6464 C14.16855,4.04495341 11.2485331,1.12515 7.64655,1.12515 C4.0447284,1.12515 1.1253,4.04479192 1.1253,7.6464 C1.1253,11.2486513 4.04462165,14.1684 7.64655,14.1684 C9.44794098,14.1684 11.1310958,13.4354367 12.3533703,12.1612565 C12.5684264,11.9370677 12.9245047,11.9296642 13.1486935,12.1447203 C13.3728823,12.3597764 13.3802858,12.7158547 13.1652297,12.9400435 C11.7328938,14.4332058 9.75756963,15.2934 7.64655,15.2934 C3.42326447,15.2934 0.0003,11.8699348 0.0003,7.6464 C0.0003,3.42349 3.42338964,0.00015 7.64655,0.00015 Z" />
          <Path d="M10.47855,6.249225 C10.7892102,6.249225 11.04105,6.50106483 11.04105,6.811725 C11.04105,7.09649682 10.8294346,7.33184322 10.5548779,7.36909004 L10.47855,7.374225 L4.7448,7.374225 C4.43413983,7.374225 4.1823,7.12238517 4.1823,6.811725 C4.1823,6.52695318 4.39391541,6.29160678 4.66847208,6.25435996 L4.7448,6.249225 L10.47855,6.249225 Z" />
          <Path d="M8.30907744,4.64225244 C8.50877736,4.44255251 8.82127512,4.42439798 9.04148374,4.58778882 L9.10457256,4.64225244 L10.8760726,6.41375244 C11.0957425,6.63342235 11.0957425,6.98957765 10.8760726,7.20924756 C10.6763726,7.40894749 10.3638749,7.42710202 10.1436663,7.26371118 L10.0805774,7.20924756 L8.30907744,5.43774756 C8.08940752,5.21807765 8.08940752,4.86192235 8.30907744,4.64225244 Z" />
          <Path d="M10.47855,8.263725 C10.7892102,8.263725 11.04105,8.51556483 11.04105,8.826225 C11.04105,9.11099682 10.8294346,9.34634322 10.5548779,9.38359004 L10.47855,9.388725 L4.7448,9.388725 C4.43413983,9.388725 4.1823,9.13688517 4.1823,8.826225 C4.1823,8.54145318 4.39391541,8.30610678 4.66847208,8.26885996 L4.7448,8.263725 L10.47855,8.263725 Z" />
          <Path d="M4.34736162,8.42824327 C4.54710381,8.22858561 4.8596054,8.21049721 5.07977944,8.37393466 L5.14285673,8.42841162 L6.91435673,10.2006616 C7.13398015,10.420378 7.13390478,10.7765333 6.91418838,10.9961567 C6.71444619,11.1958144 6.4019446,11.2139028 6.18177056,11.0504653 L6.11869327,10.9959884 L4.34719327,9.22373838 C4.12756985,9.00402198 4.12764522,8.64786668 4.34736162,8.42824327 Z" />
          <Path d="M13.191975,11.440275 C13.5026352,11.440275 13.754475,11.6921148 13.754475,12.002775 C13.754475,12.2875468 13.5428596,12.5228932 13.2683029,12.56014 L13.191975,12.565275 L10.824975,12.565275 C10.5143148,12.565275 10.262475,12.3134352 10.262475,12.002775 C10.262475,11.7180032 10.4740904,11.4826568 10.7486471,11.44541 L10.824975,11.440275 L13.191975,11.440275 Z" />
          <Path d="M13.191825,11.440125 C13.4765968,11.440125 13.7119432,11.6517404 13.74919,11.9262971 L13.754325,12.002625 L13.754325,14.369625 C13.754325,14.6802852 13.5024852,14.932125 13.191825,14.932125 C12.9070532,14.932125 12.6717068,14.7205096 12.63446,14.4459529 L12.629325,14.369625 L12.629325,12.002625 C12.629325,11.6919648 12.8811648,11.440125 13.191825,11.440125 Z" />
        </G>
      </G>
    </G>
  </Svg>
)
