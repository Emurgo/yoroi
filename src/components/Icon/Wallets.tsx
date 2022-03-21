import React from 'react'
import Svg, {G, Path, Polygon, Rect} from 'react-native-svg'

type Props = {size?: number; color?: string; backgroundColor?: string}

export const Wallets = ({size = 40, color = 'black', backgroundColor = 'transparent'}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G id="✅-REWAMP-1.1-(iOS)-current-implementation" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <G id="7.1---menu" transform="translate(-15.000000, -128.000000)">
        <Rect id="Rectangle" fill={backgroundColor} x="0" y="0" width="375" height="812" />
        <G id="icon/feedback-copy-2">
          <G transform="translate(15.000000, 128.000000)">
            <Polygon id="icon-" points="0 24 24 24 24 0 0 0" />
            <G id="icon" transform="translate(1.000000, 3.000000)" stroke={color} strokeWidth="2">
              <Path
                d="M21.9962087,2.08685217 L21.9962087,11.3529391 C21.9962087,12.5112 21.067513,13.4398957 19.9092522,13.4398957 L18.2605565,13.4398957 L18.2605565,5.82250435 C18.2605565,4.67467826 17.3224696,3.73554783 16.1736,3.73554783 L3.73533913,3.73554783 L3.73533913,2.08685217 C3.73533913,0.928591304 4.67446957,-0.000104347826 5.82229565,-0.000104347826 L19.9092522,-0.000104347826 C21.067513,-0.000104347826 21.9962087,0.928591304 21.9962087,2.08685217 Z"
                id="Stroke-1"
              />
              <Path
                d="M18.2604522,5.8226087 L18.2604522,15.0991304 C18.2604522,16.2469565 17.3223652,17.186087 16.1734957,17.186087 L2.08653913,17.186087 C0.929321739,17.186087 -0.000417391304,16.2469565 -0.000417391304,15.0991304 L-0.000417391304,5.8226087 C-0.000417391304,4.67478261 0.929321739,3.73565217 2.08653913,3.73565217 L16.1734957,3.73565217 C17.3223652,3.73565217 18.2604522,4.67478261 18.2604522,5.8226087 Z"
                id="Stroke-3"
              />
            </G>
          </G>
        </G>
      </G>
    </G>
  </Svg>
)
