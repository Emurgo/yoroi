import {atoms as a, useTheme} from '@yoroi/theme'
import {Scan} from '@yoroi/types'

import {useFocusEffect} from '@react-navigation/native'
import {useCameraPermissions} from 'expo-camera'
import * as Haptics from 'expo-haptics'
import * as React from 'react'
import {Alert, Text, TouchableOpacity, View} from 'react-native'
import {z} from 'zod'

import {useTriggerScanAction} from '~/features/Scan/common/useTriggerScanAction'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {ScanRoutes} from '~/kernel/navigation/types'
import {
  CameraCodeScanner,
  CameraCodeScannerMethods,
} from '~/ui/CameraCodeScanner/CameraCodeScanner'

import {parseScanAction} from '../common/parsers'
import {useScanErrorResolver} from '../common/useScanErrorResolver'

const scanParamsSchema = z.object({
  insideFeature: z.enum(['scan', 'send']).optional(),
})

export const ScanCodeScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const params = useParams<ScanRoutes['scan-start']>(
    (params): params is Readonly<{insideFeature: Scan.Feature}> => {
      return params && typeof params === 'object' && 'insideFeature' in params
    },
  )
  const {insideFeature} = scanParamsSchema.parse(params)
  const triggerScanAction = useTriggerScanAction({
    insideFeature: insideFeature as 'scan' | 'send',
  })
  const scanErrorResolver = useScanErrorResolver()
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = React.useRef<CameraCodeScannerMethods>(null)

  const handleBarCodeScanned = React.useCallback(
    (event: {data: string; type: string}) => {
      try {
        const parsedScanAction = parseScanAction(event.data)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        triggerScanAction(parsedScanAction)
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        const errorDialog = scanErrorResolver(error as Error)
        Alert.alert(errorDialog.title, errorDialog.message, [
          {
            text: strings.scan.continue,
            onPress: () => cameraRef.current?.continueScanning(),
          },
        ])
      }
    },
    [triggerScanAction, scanErrorResolver, strings.scan],
  )

  useFocusEffect(
    React.useCallback(() => {
      cameraRef.current?.continueScanning()
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
      <CameraCodeScanner
        ref={cameraRef}
        onRead={handleBarCodeScanned}
        withMask={true}
        maskText={strings.scan.scanTitle}
      />
    </View>
  )
}
