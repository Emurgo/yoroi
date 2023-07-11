import {BarCodeBounds, BarCodeScanner, BarCodeScannerResult} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {Path, Svg} from 'react-native-svg'

export const QRCodeScanner = ({
  onRead,
  maskEnabled = true,
  maskText = '',
}: {
  onRead: (event: BarCodeScannerResult) => Promise<boolean>
  maskEnabled?: boolean
  maskText?: string
}) => {
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
    const isQrInsideScannerBounds = maskEnabled
      ? getIsQrInsideScannerBounds({
          qrBounds: event.bounds,
          scannerBounds,
          deviceHeight,
          deviceWidth,
        })
      : true

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
        style={[StyleSheet.absoluteFill, styles.container]}
        ratio="16:9"
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={handleBarCodeScanned}
      >
        {maskEnabled && <Mask maskText={maskText} />}
      </Camera>
    </>
  )
}

const Mask = ({maskText}: {maskText: string}) => (
  <>
    <View style={styles.layerTop} />

    <View style={styles.layerCenter}>
      <View style={styles.layerLeft} />

      <View style={styles.focused}>
        <View style={styles.innerFocusedTop}>
          <Corner style={styles.topLeftCorner} />

          <Corner style={styles.topRightCorner} />
        </View>

        <View style={styles.innerFocusedCenter} />

        <View style={styles.innerFocusedBottom}>
          <Corner style={styles.bottomLeftCorner} />

          <Corner style={styles.bottomRightCorner} />
        </View>
      </View>

      <View style={styles.layerRight} />
    </View>

    <View style={styles.layerBottom}>
      <Text style={styles.text}>{maskText}</Text>
    </View>
  </>
)

const Corner = ({style}) => {
  return <ArcSvg style={{position: 'absolute', ...style}} />
}

const ArcSvg = (props) => {
  return (
    <Svg
      width={42}
      height={42}
      viewBox="0 0 42 42"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path d="M0 0h15L5.5 6 0 16V0z" fill="#000" fillOpacity={0.7} />

      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5 3C8.596 3 3 8.596 3 15.5v26a1.5 1.5 0 01-3 0v-26C0 6.94 6.94 0 15.5 0h26a1.5 1.5 0 010 3h-26z"
        fill="#fff"
      />
    </Svg>
  )
}

export const getScannerBounds = ({deviceHeight, deviceWidth}: {deviceHeight: number; deviceWidth: number}) => {
  const top = deviceHeight / 2 - QR_MAX_HEIGHT / 2
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
  const top = Number(qrBounds.origin.y) * deviceHeight
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

const QR_MAX_WIDTH = 310 // divisible number. Pixel ratio issue on low end android devices
const QR_MAX_HEIGHT = 310 // divisible number. Pixel ratio issue on low end android devices
const opacity = 'rgba(0, 0, 0, .7)'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  layerTop: {
    flex: 1,
    backgroundColor: opacity,
    marginBottom: 0,
  },
  layerCenter: {
    flexDirection: 'row',
    borderWidth: 0,
  },
  layerLeft: {
    flex: 1,
    backgroundColor: opacity,
    borderWidth: 0,
  },
  focused: {
    height: QR_MAX_HEIGHT,
    width: QR_MAX_WIDTH,
  },
  layerRight: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity,
    alignItems: 'center',
  },
  innerFocusedTop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  innerFocusedCenter: {
    flex: 1,
  },
  innerFocusedBottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    flex: 1,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    flex: 1,
    transform: [{rotate: '90deg'}],
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    transform: [{rotate: '270deg'}],
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    transform: [{rotate: '180deg'}],
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 24,
    fontSize: 16,
    maxWidth: 240,
    textAlign: 'center',
    paddingTop: 20,
  },
})
