import * as React from 'react'
import Svg, {Path} from 'react-native-svg'

type Props = {size?: number; color?: string}

export const Export = ({size = 40, color = 'black'}: Props) => {
  return (
    <Svg width={size} height={size} viewBox="-2 -2 28 28">
      <Path
        id="export"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.875 2C6.12538 2 5.39865 2.28549 4.85664 2.80582C4.31325 3.32748 4 4.04392 4 4.8V7C4 7.55228 4.44772 8 5 8C5.55229 8 6 7.55228 6 7V4.8C6 4.6013 6.08184 4.40207 6.24171 4.24859C6.40296 4.09379 6.63006 4 6.875 4H13V9C13 9.55228 13.4477 10 14 10H19V19.2C19 19.3987 18.9182 19.5979 18.7583 19.7514C18.597 19.9062 18.3699 20 18.125 20H5C4.44772 20 4 20.4477 4 21C4 21.5523 4.44772 22 5 22H18.125C18.8746 22 19.6014 21.7145 20.1434 21.1942C20.6868 20.6725 21 19.9561 21 19.2V7.95C21 7.67771 20.889 7.41719 20.6925 7.22861L15.5363 2.27861C15.3501 2.09983 15.1019 2 14.8438 2H6.875ZM18.6081 8L15 4.53622V8H18.6081Z"
        fill={color}
      />
      <Path
        d="M5.41421 13L6.70711 11.7071C7.09763 11.3166 7.09763 10.6834 6.70711 10.2929C6.31658 9.90237 5.68342 9.90237 5.29289 10.2929L2.29289 13.2929C1.90237 13.6834 1.90237 14.3166 2.29289 14.7071L5.29289 17.7071C5.68342 18.0976 6.31658 18.0976 6.70711 17.7071C7.09763 17.3166 7.09763 16.6834 6.70711 16.2929L5.41421 15H13C13.5523 15 14 14.5523 14 14C14 13.4477 13.5523 13 13 13H5.41421Z"
        fill={color}
      />
    </Svg>
  )
}

export default Export
