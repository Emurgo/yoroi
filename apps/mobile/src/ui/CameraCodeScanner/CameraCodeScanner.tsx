import {atoms as a, useTheme} from '@yoroi/theme'
import {CameraView, useCameraPermissions} from 'expo-camera'
import React, {useCallback, useState} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

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
  const {palette: p} = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = useCallback(
    (event: {data: string; type: string}) => {
      if (!scanned) {
        setScanned(true)
        onRead(event)
      }
    },
    [scanned, onRead],
  )

  if (!permission)
    return <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]} />
  if (!permission.granted) {
    return (
      <View
        style={[
          a.flex_1,
          a.justify_center,
          a.align_center,
          {backgroundColor: p.bg_color_max},
        ]}
      >
        <Text style={[a.body_1_lg_regular, {color: p.gray_max}]}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[
            a.pt_lg,
            a.p_md,
            {backgroundColor: p.el_primary_medium},
            a.rounded_md,
          ]}
        >
          <Text style={[a.body_1_lg_regular, {color: p.text_primary_max}]}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
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
                borderColor: p.el_primary_medium,
                borderRadius: 16,
              },
            ]}
          />
          {maskText && (
            <Text
              style={[
                a.pt_lg,
                a.body_1_lg_regular,
                {color: p.text_primary_max, textAlign: 'center'},
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
