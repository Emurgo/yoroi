import {atoms as a, useTheme} from '@yoroi/theme'
import {CameraView, useCameraPermissions} from 'expo-camera'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'

export type CameraCodeScannerProps = {
  onRead: (event: {data: string; type: string}) => void
  withMask?: boolean
  maskText?: string
}

export const CameraCodeScanner = ({
  onRead,
  withMask,
  maskText,
}: CameraCodeScannerProps) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = React.useState(false)

  const handleBarCodeScanned = React.useCallback(
    (event: {data: string; type: string}) => {
      if (!scanned) {
        setScanned(true)
        onRead(event)
      }
    },
    [scanned, onRead],
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
    <View style={[a.flex_1, ta.bg_color_max]}>
      <CameraView
        style={[a.absolute, a.inset_0]}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{barcodeTypes: ['qr']}}
      />
      {withMask && (
        <View
          style={[
            a.absolute,
            a.inset_0,
            a.justify_center,
            a.align_center,
            {pointerEvents: 'none'},
          ]}
        >
          <View
            style={[
              {
                width: 240,
                height: 240,
                borderWidth: 2,
                borderColor: ta.el_primary_medium.color,
                borderRadius: 16,
              },
            ]}
          />
          {maskText && (
            <Text
              style={[
                a.pt_lg,
                a.body_1_lg_regular,
                ta.text_primary_max,
                a.text_center,
              ]}
            >
              {maskText}
            </Text>
          )}
        </View>
      )}
    </View>
  )
}
