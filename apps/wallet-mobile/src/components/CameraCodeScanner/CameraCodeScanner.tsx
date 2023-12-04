import {useFocusEffect} from '@react-navigation/native'
import {BarCodeBounds, BarCodeScanner, BarCodeScannerResult} from 'expo-barcode-scanner'
import {Camera} from 'expo-camera'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {Path, Svg} from 'react-native-svg'

export type CameraCodeScannerMethods = {
  continueScanning: () => void
  stopScanning: () => void
}
export type CameraCodeScannerProps = {
  onRead: (event: BarCodeScannerResult) => void
  withMask?: boolean
  maskText?: string
  onCameraPermissionDenied?: () => void
}
export const CameraCodeScanner = React.forwardRef<CameraCodeScannerMethods, CameraCodeScannerProps>(
  ({onRead, withMask, maskText = '', onCameraPermissionDenied}, ref) => {
    const [status] = Camera.useCameraPermissions({request: true, get: true})
    const {height: deviceHeight, width: deviceWidth} = useWindowDimensions()
    const qrScanned = React.useRef(false)

    React.useImperativeHandle(ref, () => ({
      continueScanning: () => {
        qrScanned.current = false
      },
      stopScanning: () => {
        qrScanned.current = true
      },
    }))

    useFocusEffect(
      React.useCallback(() => {
        if (qrScanned.current) qrScanned.current = false
      }, [qrScanned]),
    )

    React.useEffect(() => {
      if (status?.granted === false) onCameraPermissionDenied?.()
    }, [onCameraPermissionDenied, status?.granted])

    const handleOnBarCodeScanned = React.useCallback(
      (event) => {
        const scannerBounds = getScannerBounds({deviceHeight, deviceWidth})
        const isQrInsideScannerBounds =
          withMask && (event.bounds !== undefined || event.boundingBox !== undefined)
            ? getIsQrInsideScannerBounds({
                qrBounds: event.bounds,
                qrBoundingBox: event.boundingBox,
                scannerBounds,
                deviceHeight,
                deviceWidth,
              })
            : true

        if (!qrScanned.current && isQrInsideScannerBounds) onRead(event)
      },
      [deviceHeight, deviceWidth, onRead, qrScanned, withMask],
    )

    if (!status?.granted) {
      return null
    }

    return (
      /*
       * expo-barcode-scanner issue in android https://github.com/expo/expo/issues/5212
       * so expo-camera is used
       */
      <Camera
        style={[StyleSheet.absoluteFill, styles.container]}
        ratio="16:9"
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr, BarCodeScanner.Constants.BarCodeType.pdf417],
        }}
        onBarCodeScanned={handleOnBarCodeScanned}
      >
        {withMask && <Mask maskText={maskText} />}
      </Camera>
    )
  },
)

const Mask = React.memo(({maskText}: {maskText: string}) => {
  return (
    <View style={styles.maskContainer}>
      <LayerTop />

      <LayerCenter>
        <LayerCenterLeft />

        <CameraOpening>
          <InnerCameraOpeningTop>
            <TopLeftCorner />

            <TopRightCorner />
          </InnerCameraOpeningTop>

          <InnerCameraOpeningCenter />

          <InnerCameraOpeningBottom>
            <BottomRightCorner />

            <BottomLeftCorner />
          </InnerCameraOpeningBottom>
        </CameraOpening>

        <LayerCenterRight />
      </LayerCenter>

      <LayerBottom>
        <MaskText>{maskText}</MaskText>
      </LayerBottom>
    </View>
  )
})

const LayerTop = ({children}: {children?: React.ReactNode}) => <View style={styles.layerTop}>{children}</View>
const LayerCenter = ({children}: {children?: React.ReactNode}) => <View style={styles.layerCenter}>{children}</View>
const LayerCenterLeft = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerCenterLeft}>{children}</View>
)
const LayerCenterRight = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerCenterRight}>{children}</View>
)
const LayerBottom = ({children}: {children?: React.ReactNode}) => <View style={styles.layerBottom}>{children}</View>
const CameraOpening = ({children}: {children?: React.ReactNode}) => <View style={styles.cameraOpening}>{children}</View>
const InnerCameraOpeningTop = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.innerCameraOpeningTop}>{children}</View>
)
const InnerCameraOpeningCenter = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.innerCameraOpeningCenter}>{children}</View>
)
const InnerCameraOpeningBottom = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.innerCameraOpeningBottom}>{children}</View>
)
const TopLeftCorner = () => <Corner style={styles.topLeftCorner} />
const TopRightCorner = () => <Corner style={styles.topRightCorner} />
const BottomRightCorner = () => <Corner style={styles.bottomRightCorner} />
const BottomLeftCorner = () => <Corner style={styles.bottomLeftCorner} />

const MaskText = ({children}: {children?: React.ReactNode}) => <Text style={styles.text}>{children}</Text>

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
  qrBoundingBox,
  deviceHeight,
  deviceWidth,
}: {
  qrBounds: BarCodeBounds
  qrBoundingBox: BarCodeBounds
  deviceHeight: number
  deviceWidth: number
}) => {
  // qr bounds values are inversely proportioned
  const height = qrBoundingBox !== undefined ? qrBoundingBox.size.width : Number(qrBounds.size.width) * deviceHeight
  const width = qrBoundingBox !== undefined ? qrBoundingBox.size.height : Number(qrBounds.size.height) * deviceWidth
  const left = qrBoundingBox !== undefined ? qrBoundingBox.origin.y : Number(qrBounds.origin.y) * deviceWidth
  const top = qrBoundingBox !== undefined ? qrBoundingBox.origin.x : Number(qrBounds.origin.x) * deviceHeight
  const bottom = top + height
  const right = left + width

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
  qrBoundingBox,
  scannerBounds,
  deviceHeight,
  deviceWidth,
}: {
  qrBounds: BarCodeBounds
  qrBoundingBox: BarCodeBounds
  scannerBounds: ReturnType<typeof getScannerBounds>
  deviceHeight: number
  deviceWidth: number
}) => {
  const scaledQrBounds = getScaledQrBounds({qrBounds, qrBoundingBox, deviceHeight, deviceWidth})

  return (
    scaledQrBounds.top > scannerBounds.top &&
    scaledQrBounds.bottom < scannerBounds.bottom &&
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
  maskContainer: {
    flex: 1,
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
  layerCenterLeft: {
    flex: 1,
    backgroundColor: opacity,
    borderWidth: 0,
  },
  cameraOpening: {
    height: QR_MAX_HEIGHT,
    width: QR_MAX_WIDTH,
  },
  layerCenterRight: {
    flex: 1,
    backgroundColor: opacity,
  },
  layerBottom: {
    flex: 1,
    backgroundColor: opacity,
    alignItems: 'center',
  },
  innerCameraOpeningTop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  innerCameraOpeningCenter: {
    flex: 1,
  },
  innerCameraOpeningBottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
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
