import {BarCodeBounds, BarCodeScanner, BarCodeScannerResult} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet, useWindowDimensions, View} from 'react-native'
import { Path, Svg } from 'react-native-svg'

export const QRCodeScanner = ({onRead}: {onRead: (event: BarCodeScannerResult) => Promise<boolean>}) => {
  const [status, requestPermissions] = Camera.useCameraPermissions()
  const {height: deviceHeight, width: deviceWidth} = useWindowDimensions()
  const [qrScanned, setQrScanned] = React.useState(false)

  const scannerBounds = getScannerBounds({deviceHeight, deviceWidth})
  const granted = status && status.granted

  React.useEffect(() => {
    if (!granted) {
      requestPermissions()
    }
  }, [granted, requestPermissions])

  const handleBarCodeScanned = async (event) => {
    const isQrInsideScannerBounds = getIsQrInsideScannerBounds({
      qrBounds: event.bounds,
      scannerBounds,
      deviceHeight,
      deviceWidth,
    })

    if (!qrScanned && isQrInsideScannerBounds) {
      setQrScanned(true)
      const error = await onRead(event)

      if (error) {
        setQrScanned(false)
      }
    }
  }

  if (!granted) {
    return null
  }

  return (
    <>
      {/*
       * expo-barcode-scanner issue in android https://github.com/expo/expo/issues/5212
       * so expo-camera is used
       */}
      <Camera
        style={StyleSheet.absoluteFill}
        ratio="16:9"
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={handleBarCodeScanned}
      />

      <Mask />
    </>
  )
}

const Mask = () => {
  const {height: deviceHeight, width: deviceWidth} = useWindowDimensions()
  const sb = getScannerBounds({deviceHeight, deviceWidth})

  return (
    <>
      <View
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          opacity: 0.5,
          height: sb.bottom,
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
    </>
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

const HEIGHT_OFFSET = -50
const QR_MAX_WIDTH = 300
const QR_MAX_HEIGHT = 300

export const getScannerBounds = ({deviceHeight, deviceWidth}: {deviceHeight: number; deviceWidth: number}) => {
  const top = 200
  const bottom = top + QR_MAX_HEIGHT
  const left = deviceWidth / 2 - QR_MAX_WIDTH / 2
  const right = left + QR_MAX_WIDTH

  return {
    width: QR_MAX_WIDTH,
    height: QR_MAX_HEIGHT,
    top,
    bottom,
    left,
    right,
  }
}

export const getScaledQrBounds = ({
  qrBounds,
  deviceHeight,
  deviceWidth,
}: {
  qrBounds: BarCodeBounds
  deviceHeight: number
  deviceWidth: number
}) => {
  const height = Number(qrBounds.size.height) * deviceHeight
  const width = Number(qrBounds.size.width) * deviceWidth
  const right = Number(qrBounds.origin.x) * deviceWidth
  const top = Number(qrBounds.origin.y) * deviceHeight + HEIGHT_OFFSET
  const bottom = top + height
  const left = right + width

  return {
    height,
    width,
    right,
    top,
    bottom,
    left,
  }
}

export const getIsQrInsideScannerBounds = ({
  qrBounds,
  scannerBounds,
  deviceHeight,
  deviceWidth,
}: {
  qrBounds: BarCodeBounds
  scannerBounds: ReturnType<typeof getScannerBounds>
  deviceHeight: number
  deviceWidth: number
}) => {
  const scaledQrBounds = getScaledQrBounds({qrBounds, deviceHeight, deviceWidth})
  return (
    scaledQrBounds.top < scannerBounds.top &&
    scaledQrBounds.bottom > scannerBounds.bottom &&
    scaledQrBounds.left > scannerBounds.left &&
    scaledQrBounds.right < scannerBounds.right
  )
}
