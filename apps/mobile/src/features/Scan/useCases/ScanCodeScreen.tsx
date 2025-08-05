import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {CameraView, useCameraPermissions} from 'expo-camera'
import * as Haptics from 'expo-haptics'
import React, {useCallback, useRef, useState} from 'react'
import {Alert, Text, TouchableOpacity, View} from 'react-native'
import {z} from 'zod'

import {useTriggerScanAction} from '~/features/Scan/common/useTriggerScanAction'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ScanRoutes, useParams} from '~/kernel/navigation'
import {useWalletNavigation} from '~/kernel/navigation/navigation'

const scanParamsSchema = z.object({
  insideFeature: z.string().optional(),
})

export const ScanCodeScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {navigateToTxHistory} = useWalletNavigation()
  const params = useParams<ScanRoutes['scan-start']>((params) => {
    return params && typeof params === 'object' && 'insideFeature' in params
  })
  const {insideFeature} = scanParamsSchema.parse(params)
  const triggerScanAction = useTriggerScanAction({
    insideFeature: insideFeature as any,
  })
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const handleBarCodeScanned = useCallback(
    (event: {data: string; type: string}) => {
      if (scanned) return
      setScanned(true)

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        triggerScanAction({action: 'send-only-receiver', receiver: event.data})
        navigateToTxHistory()
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        Alert.alert(
          strings.scan.errorUnknownTitle,
          strings.scan.errorUnknownHelp,
          [
            {
              text: strings.scan.continue,
              onPress: () => setScanned(false),
            },
          ],
        )
      }
    },
    [scanned, triggerScanAction, navigateToTxHistory, strings.scan],
  )

  const handleScanAgain = useCallback(() => {
    setScanned(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      setScanned(false)
    }, []),
  )

  if (!permission) {
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
          Requesting camera permission...
        </Text>
      </View>
    )
  }

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
        ref={cameraRef}
        style={[a.flex_1]}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {scanned && (
        <View
          style={[
            a.absolute,
            a.inset_0,
            a.justify_center,
            a.align_center,
            {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
          ]}
        >
          <View
            style={[
              a.p_lg,
              {backgroundColor: p.bg_color_min},
              a.rounded_md,
              a.px_md,
            ]}
          >
            <Text
              style={[
                a.body_1_lg_regular,
                a.text_center,
                a.pb_md,
                {color: p.gray_max},
              ]}
            >
              QR Code Scanned Successfully
            </Text>
            <View style={[a.flex_row, a.gap_md]}>
              <TouchableOpacity
                style={[
                  a.flex_1,
                  a.p_md,
                  {backgroundColor: p.el_primary_medium},
                  a.rounded_md,
                  a.align_center,
                ]}
                onPress={() => navigateToTxHistory()}
              >
                <Text
                  style={[a.body_1_lg_regular, {color: p.text_primary_max}]}
                >
                  {strings.scan.continue}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  a.flex_1,
                  a.p_md,
                  {backgroundColor: p.el_gray_medium},
                  a.rounded_md,
                  a.align_center,
                ]}
                onPress={handleScanAgain}
              >
                <Text
                  style={[a.body_1_lg_regular, {color: p.text_primary_max}]}
                >
                  Scan Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
