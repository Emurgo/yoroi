import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import {CameraView, useCameraPermissions} from 'expo-camera'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {Path, Svg, SvgProps} from 'react-native-svg'

import {useStrings} from '~/kernel/i18n/useStrings'

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
  onCameraPermissionDenied?: () => void
}

export const CameraCodeScanner = React.forwardRef<
  CameraCodeScannerMethods,
  CameraCodeScannerProps
>(({onRead, withMask, maskText = '', onCameraPermissionDenied}, ref) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const [permission, requestPermission] = useCameraPermissions()
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
    if (permission?.granted === false) onCameraPermissionDenied?.()
  }, [onCameraPermissionDenied, permission?.granted])

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

      qrScanned.current = true
      onRead(event)
    },
    [onRead, qrScanned],
  )

  if (!permission) return <View style={[a.flex_1, ta.bg_color_max]} />

  if (!permission.granted) {
    return (
      <View
        style={[a.flex_1, a.justify_center, a.align_center, ta.bg_color_max]}
      >
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.scan.needCameraPermission}
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[a.pt_lg, a.p_md, ta.bg_color_min, a.rounded_md]}
        >
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            {strings.scan.grantPermission}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

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
