// @flow

import React, {memo} from 'react'
import Svg, {G, Path} from 'react-native-svg'

type Props = {|
  width?: number,
  height?: number,
  color?: string,
|}

const SentIcon = ({width = 36, height = 36, color = '#6B7384'}: Props) => (
  <Svg viewBox="0 0 36 36" version="1.1" xmlns="http://www.w3.org/2000/svg" {...{width, height}}>
    <G stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <G transform="translate(-760.000000, -186.000000)">
        <G transform="translate(760.000000, 186.000000)">
          <G transform="translate(6.000000, 6.000000)" fill={color}>
            <Path d="M19.7727454,5 C20.1577293,5 20.5276523,5.1826508 20.7623185,5.50450952 C21.0575931,5.90954811 21.0796193,6.45419824 20.8179309,6.88202231 L20.8179309,6.88202231 L14.8678751,16.6118277 C14.6361991,16.9906318 14.2338569,17.1997373 13.8214862,17.1997373 C13.6064758,17.1997373 13.3888032,17.142902 13.1911877,17.0235809 L13.1911877,17.0235809 L10.6583606,15.4945685 L7.57517105,17.9090593 C7.44596788,18.0102547 7.27070668,18.0285272 7.12359813,17.9561713 C6.97652605,17.8837788 6.88320657,17.7334166 6.88320657,17.5686713 L6.88320657,17.5686713 L6.88320657,13.2154697 L3.59594676,11.2309677 C3.17059373,10.9742366 2.94070471,10.4851009 3.0132379,9.99137867 C3.08591697,9.49769318 3.44672311,9.09643382 3.92779798,8.9746544 L3.92779798,8.9746544 L19.4731312,5.03742544 C19.5726136,5.01221831 19.6731901,5 19.7727454,5 Z M19.2937492,6.58845281 L4.8048698,10.2580899 L7.6976278,12.0045001 L13.6534819,9.6876089 C13.7208733,9.66137441 13.7972355,9.68779236 13.8343591,9.75013139 C13.8715556,9.81247042 13.8587191,9.89267826 13.8039455,9.94015719 L13.8039455,9.94015719 L9.89382645,13.3302777 L13.7479684,15.6570756 L19.2937492,6.58845281 Z" />
          </G>
        </G>
      </G>
    </G>
  </Svg>
)

export default memo<Props>(SentIcon)
