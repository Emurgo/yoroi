import {useFocusEffect} from '@react-navigation/native'
import {Camera, CameraType} from 'expo-camera'
import * as React from 'react'
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native'
import {Path, Svg, SvgProps} from 'react-native-svg'

export type CameraCodeScannerMethods = {
  continueScanning: () => void
  stopScanning: () => void
}

type CameraCodeScannerProps = {
  onRead: (event: {data: string; type: string}) => void
  withMask?: boolean
  maskText?: string
  onCameraPermissionDenied?: () => void
}

export const CameraCodeScanner = React.forwardRef<
  CameraCodeScannerMethods,
  CameraCodeScannerProps
>(({onRead, withMask, maskText = '', onCameraPermissionDenied}, ref) => {
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
    (event: {data: string; type: string}) => {
      if (!qrScanned.current) {
        onRead(event)
      }
    },
    [onRead, qrScanned],
  )

  if (!status?.granted) {
    return null
  }

  return (
    <Camera
      style={[StyleSheet.absoluteFill, styles.container]}
      type={CameraType.back}
      onBarCodeScanned={handleOnBarCodeScanned}
      barCodeScannerSettings={{
        barCodeTypes: ['qr', 'pdf417'],
      }}
    >
      {withMask && <Mask maskText={maskText} />}
    </Camera>
  )
})

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
            <BottomLeftCorner />
            <BottomRightCorner />
          </InnerCameraOpeningBottom>
        </CameraOpening>
        <LayerCenterRight />
      </LayerCenter>
      <LayerBottom />
      <MaskText>{maskText}</MaskText>
    </View>
  )
})

const LayerTop = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerTop}>{children}</View>
)
const LayerCenter = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerCenter}>{children}</View>
)
const LayerCenterLeft = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerCenterLeft}>{children}</View>
)
const LayerCenterRight = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerCenterRight}>{children}</View>
)
const LayerBottom = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.layerBottom}>{children}</View>
)
const CameraOpening = ({children}: {children?: React.ReactNode}) => (
  <View style={styles.cameraOpening}>{children}</View>
)
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
const MaskText = ({children}: {children?: React.ReactNode}) => (
  <Text style={styles.text}>{children}</Text>
)

const Corner = ({style}: SvgProps) => {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" style={style}>
      <Path d="M0 0h20v2H0z" fill="#fff" />
      <Path d="M0 0v20h2V0z" fill="#fff" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  maskContainer: {
    flex: 1,
  },
  layerTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  layerCenter: {
    flexDirection: 'row',
    height: 300,
  },
  layerCenterLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraOpening: {
    width: 300,
    height: 300,
  },
  layerCenterRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  layerBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  innerCameraOpeningTop: {
    flexDirection: 'row',
    height: 20,
  },
  innerCameraOpeningCenter: {
    flex: 1,
  },
  innerCameraOpeningBottom: {
    flexDirection: 'row',
    height: 20,
  },
  topLeftCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  text: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },
})
