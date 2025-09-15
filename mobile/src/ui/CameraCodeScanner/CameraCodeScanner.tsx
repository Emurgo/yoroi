import {atoms as a} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import {CameraView} from 'expo-camera'
import * as React from 'react'
import {Text, View, useWindowDimensions} from 'react-native'
import {Path, Svg, SvgProps} from 'react-native-svg'

export type CameraCodeScannerMethods = {
  continueScanning: () => void
  stopScanning: () => void
}

export type CameraCodeScannerProps = {
  onRead: (event: {
    data: string
    type: string
    bounds?: {
      origin: {x: number; y: number}
      size: {width: number; height: number}
    }
    boundingBox?: {
      origin: {x: number; y: number}
      size: {width: number; height: number}
    }
  }) => void
  withMask?: boolean
  maskText?: string
}

export const CameraCodeScanner = React.forwardRef<
  CameraCodeScannerMethods,
  CameraCodeScannerProps
>(({onRead, withMask, maskText = ''}, ref) => {
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

  const handleBarCodeScanned = React.useCallback(
    (event: {
      data: string
      type: string
      bounds?: {
        origin: {x: number; y: number}
        size: {width: number; height: number}
      }
      boundingBox?: {
        origin: {x: number; y: number}
        size: {width: number; height: number}
      }
    }) => {
      if (qrScanned.current) return

      let isQrInsideScannerBounds = true

      if (withMask && (event.bounds || event.boundingBox)) {
        const scannerBounds = getScannerBounds({deviceHeight, deviceWidth})
        isQrInsideScannerBounds = getIsQrInsideScannerBounds({
          qrBounds: event.bounds,
          qrBoundingBox: event.boundingBox,
          scannerBounds,
          deviceHeight,
          deviceWidth,
        })
      }

      if (isQrInsideScannerBounds) {
        qrScanned.current = true
        onRead(event)
      }
    },
    [deviceHeight, deviceWidth, onRead, qrScanned, withMask],
  )

  return (
    <CameraView
      style={[a.absolute, a.inset_0, a.flex_1, a.flex_col]}
      facing="back"
      onBarcodeScanned={handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    >
      {withMask && <Mask maskText={maskText} />}
    </CameraView>
  )
})

const Mask = React.memo(({maskText}: {maskText: string}) => {
  return (
    <View style={[a.flex_1]}>
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

const LayerTop = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
    {children}
  </View>
)
const LayerCenter = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_row]}>{children}</View>
)
const LayerCenterLeft = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
    {children}
  </View>
)
const LayerCenterRight = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}>
    {children}
  </View>
)
const LayerBottom = ({children}: {children?: React.ReactNode}) => (
  <View
    style={[a.flex_1, a.align_center, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}
  >
    {children}
  </View>
)
const CameraOpening = ({children}: {children?: React.ReactNode}) => (
  <View style={[{height: QR_MAX_HEIGHT, width: QR_MAX_WIDTH}]}>{children}</View>
)
const InnerCameraOpeningTop = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1, a.flex_row, a.justify_between, a.relative]}>
    {children}
  </View>
)
const InnerCameraOpeningCenter = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1]}>{children}</View>
)
const InnerCameraOpeningBottom = ({children}: {children?: React.ReactNode}) => (
  <View style={[a.flex_1, a.flex_row, a.justify_between, a.relative]}>
    {children}
  </View>
)
const TopLeftCorner = () => <Corner style={[a.absolute, {top: 0, left: 0}]} />
const TopRightCorner = () => (
  <Corner
    style={[
      a.absolute,
      {
        top: 0,
        right: 0,
        transform: [{rotate: '90deg'}],
      },
    ]}
  />
)
const BottomRightCorner = () => (
  <Corner
    style={[
      a.absolute,
      {
        bottom: 0,
        right: 0,
        transform: [{rotate: '180deg'}],
      },
    ]}
  />
)
const BottomLeftCorner = () => (
  <Corner
    style={[
      a.absolute,
      {
        bottom: 0,
        left: 0,
        transform: [{rotate: '270deg'}],
      },
    ]}
  />
)

const MaskText = ({children}: {children?: React.ReactNode}) => (
  <Text
    style={[
      a.body_1_lg_medium,
      a.text_center,
      a.pt_lg,
      {color: '#fff', maxWidth: 240},
    ]}
  >
    {children}
  </Text>
)

const Corner = ({style}: SvgProps) => {
  return <ArcSvg style={style} />
}

const ArcSvg = (props: SvgProps) => {
  return (
    <Svg
      width={42}
      height={42}
      viewBox="0 0 42 42"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
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

const QR_MAX_WIDTH = 310
const QR_MAX_HEIGHT = 310

const getScannerBounds = ({
  deviceHeight,
  deviceWidth,
}: {
  deviceHeight: number
  deviceWidth: number
}) => {
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

const getIsQrInsideScannerBounds = ({
  qrBounds,
  qrBoundingBox,
  scannerBounds,
}: {
  qrBounds?: {
    origin: {x: number; y: number}
    size: {width: number; height: number}
  }
  qrBoundingBox?: {
    origin: {x: number; y: number}
    size: {width: number; height: number}
  }
  scannerBounds: ReturnType<typeof getScannerBounds>
  deviceHeight: number
  deviceWidth: number
}) => {
  if (!qrBounds && !qrBoundingBox) return false

  const bounds = qrBounds || qrBoundingBox!

  // Use a more lenient approach - check if QR center is inside scanner bounds
  const qrCenterX = bounds.origin.x + bounds.size.width / 2
  const qrCenterY = bounds.origin.y + bounds.size.height / 2

  return (
    qrCenterX >= scannerBounds.left &&
    qrCenterX <= scannerBounds.right &&
    qrCenterY >= scannerBounds.top &&
    qrCenterY <= scannerBounds.bottom
  )
}
