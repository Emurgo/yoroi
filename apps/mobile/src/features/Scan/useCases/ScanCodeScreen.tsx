import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {CameraView, useCameraPermissions} from 'expo-camera'
import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {Alert, Text, TouchableOpacity, View} from 'react-native'
import {z} from 'zod'

import {useTriggerScanAction} from '~/features/Scan/common/useTriggerScanAction'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useParams} from '~/kernel/navigation/hooks'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {ScanRoutes} from '~/kernel/navigation/types'

const scanParamsSchema = z.object({
  insideFeature: z.enum(['scan', 'send']).optional(),
})

export const ScanCodeScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const {navigateToTxHistory} = useWalletNavigation()
  const params = useParams<ScanRoutes['scan-start']>((params) => {
    return params && typeof params === 'object' && 'insideFeature' in params
  })
  const {insideFeature} = scanParamsSchema.parse(params)
  const triggerScanAction = useTriggerScanAction({
    insideFeature: insideFeature as 'scan' | 'send',
  })
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = React.useState(false)
  const cameraRef = React.useRef<CameraView>(null)

  const handleBarCodeScanned = React.useCallback(
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

  const handleScanAgain = React.useCallback(() => {
    setScanned(false)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      setScanned(false)
    }, []),
  )

  if (!permission) {
    return (
      <View
        style={[a.flex_1, a.justify_center, a.align_center, ta.bg_color_max]}
      >
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.scan.requestingCameraPermission}
        </Text>
      </View>
    )
  }

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
          <View style={[a.p_lg, ta.bg_color_min, a.rounded_md, a.px_md]}>
            <Text
              style={[
                a.body_1_lg_regular,
                a.text_center,
                a.pb_md,
                ta.text_gray_max,
              ]}
            >
              {strings.scan.qrCodeScannedSuccessfully}
            </Text>
            <View style={[a.flex_row, a.gap_md]}>
              <TouchableOpacity
                style={[
                  a.flex_1,
                  a.p_md,
                  ta.bg_color_min,
                  a.rounded_md,
                  a.align_center,
                ]}
                onPress={() => navigateToTxHistory()}
              >
                <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
                  {strings.scan.continue}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  a.flex_1,
                  a.p_md,
                  ta.bg_color_max,
                  a.rounded_md,
                  a.align_center,
                ]}
                onPress={handleScanAgain}
              >
                <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
                  {strings.scan.scanAgain}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
