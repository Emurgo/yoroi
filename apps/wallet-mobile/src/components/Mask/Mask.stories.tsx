import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {useWindowDimensions, View} from 'react-native'
import {Path, Svg} from 'react-native-svg'

import {getScannerBounds} from '../QRCodeScanner'

storiesOf('Mask', module).add('Default', () => <Mask />)

const Mask = () => {
  const {height: deviceHeight, width: deviceWidth} = useWindowDimensions()
  const sb = getScannerBounds({deviceHeight, deviceWidth})

  return (
    <View style={[{backgroundColor: 'blue', height: deviceHeight}]}>
      <View
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          opacity: 0.5,
          height: deviceHeight - sb.top - sb.height,
          bottom: 0,
          width: deviceWidth,
        }}
      />

      <View
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          opacity: 0.5,
          height: sb.height,
          top: sb.top,
          left: 0,
          width: deviceWidth - sb.right,
        }}
      />

      <View
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          opacity: 0.5,
          height: sb.height,
          top: sb.top,
          right: 0,
          width: deviceWidth - sb.right,
        }}
      />

      <View
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          opacity: 0.5,
          height: sb.top,
          top: 0,
          width: deviceWidth,
        }}
      />

      <Triangle style={{position: 'absolute', top: sb.top, left: sb.left, transform: [{rotate: '0deg'}]}} />

      <Corner style={{position: 'absolute', top: sb.top, left: sb.left, transform: [{rotate: '0deg'}]}} />

      <Triangle
        style={{position: 'absolute', top: sb.top, right: deviceWidth - sb.right, transform: [{rotate: '90deg'}]}}
      />

      <Corner
        style={{position: 'absolute', top: sb.top, right: deviceWidth - sb.right, transform: [{rotate: '90deg'}]}}
      />

      <Triangle
        style={{
          position: 'absolute',
          top: sb.bottom - 15,
          right: deviceWidth - sb.right,
          transform: [{rotate: '180deg'}],
        }}
      />

      <Corner
        style={{
          position: 'absolute',
          top: sb.bottom - 44,
          right: deviceWidth - sb.right,
          transform: [{rotate: '180deg'}],
        }}
      />

      <Corner
        style={{
          position: 'absolute',
          top: sb.bottom - 44,
          right: deviceWidth - sb.right,
          transform: [{rotate: '180deg'}],
        }}
      />

      <Triangle
        style={{
          position: 'absolute',
          top: sb.bottom - 15,
          left: sb.left,
          transform: [{rotate: '270deg'}],
        }}
      />

      <Corner
        style={{
          position: 'absolute',
          top: sb.bottom - 44,
          left: sb.left,
          transform: [{rotate: '270deg'}],
        }}
      />
    </View>
  )
}

const Triangle = ({style}) => (
  <View
    style={{
      ...style,
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderRightWidth: 15,
      borderTopWidth: 15,
      borderRightColor: 'transparent',
      borderTopColor: 'black',
      opacity: 0.5,
    }}
  />
)

const Corner = (props) => {
  return (
    <Svg width={43} height={43} viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5 3C8.596 3 3 8.596 3 15.5v26a1.5 1.5 0 01-3 0v-26C0 6.94 6.94 0 15.5 0h26a1.5 1.5 0 010 3h-26z"
        fill="#fff"
      />
    </Svg>
  )
}
