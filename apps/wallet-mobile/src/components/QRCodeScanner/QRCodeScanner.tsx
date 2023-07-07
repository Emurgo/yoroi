import {BarCodeScanner, BarCodeScannerResult} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet, useWindowDimensions} from 'react-native'

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
    const IsQrInsideScannerBounds = getIsQrInsideScannerBounds({
      qrBounds: event.bounds,
      scannerBounds,
      deviceHeight,
      deviceWidth,
    })

    if (!qrScanned && IsQrInsideScannerBounds) {
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
    // expo-barcode-scanner issue in android https://github.com/expo/expo/issues/5212
    // so expo-camera is used
    <Camera
      style={StyleSheet.absoluteFill}
      ratio="16:9"
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
      onBarCodeScanned={handleBarCodeScanned}
    />
  )
}

const HEIGHT_OFFSET = -50
const QR_MAX_WIDTH = 300
const QR_MAX_HEIGHT = 300

export const getScannerBounds = ({deviceHeight, deviceWidth}) => {
  const top = deviceHeight / 2 - QR_MAX_HEIGHT / 2 + HEIGHT_OFFSET
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

export const getScaledQrBounds = ({bounds, deviceHeight, deviceWidth}) => {
  const height = Number(bounds.size.height) * deviceHeight
  const width = Number(bounds.size.width) * deviceWidth
  const right = Number(bounds.origin.x) * deviceWidth
  const top = Number(bounds.origin.y) * deviceHeight + HEIGHT_OFFSET
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

export const getIsQrInsideScannerBounds = ({qrBounds, scannerBounds, deviceHeight, deviceWidth}) => {
  const scaledQrBounds = getScaledQrBounds({bounds: qrBounds, deviceHeight, deviceWidth})
  return (
    scaledQrBounds.top < scannerBounds.top &&
    scaledQrBounds.bottom > scannerBounds.bottom &&
    scaledQrBounds.left > scannerBounds.left &&
    scaledQrBounds.right < scannerBounds.right
  )
}
