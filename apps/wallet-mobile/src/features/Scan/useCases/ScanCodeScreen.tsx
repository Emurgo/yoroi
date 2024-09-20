import {createTypeGuardFromSchema} from '@yoroi/common'
import {BarCodeScannerResult} from 'expo-barcode-scanner'
import * as React from 'react'
import {Alert, AlertButton} from 'react-native'
import {z} from 'zod'

import {CameraCodeScanner, CameraCodeScannerMethods} from '../../../components/CameraCodeScanner/CameraCodeScanner'
import * as feedback from '../../../kernel/haptics/feedback'
import {ScanRoutes, useParams} from '../../../kernel/navigation'
import {parseScanAction} from '../common/parsers'
import {useNavigateTo} from '../common/useNavigateTo'
import {useScanErrorResolver} from '../common/useScanErrorResolver'
import {useStrings} from '../common/useStrings'
import {useTriggerScanAction} from '../common/useTriggerScanAction'

export const ScanCodeScreen = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const scannerRef = React.useRef<CameraCodeScannerMethods>(null)
  const [buttons] = React.useState<AlertButton[]>([
    {text: strings.ok, onPress: () => scannerRef.current?.continueScanning()},
  ])
  const scanErrorResolver = useScanErrorResolver()
  const {insideFeature} = useParams<Params>(isParams)
  const trigger = useTriggerScanAction({insideFeature})

  const handleOnRead = React.useCallback(
    (event: BarCodeScannerResult) => {
      scannerRef.current?.stopScanning()
      const {data: codeContent} = event

      try {
        const parsedScanAction = parseScanAction(codeContent)
        feedback.success()

        return trigger(parsedScanAction)
      } catch (error) {
        feedback.error()

        const errorDialog = scanErrorResolver(error as Error)
        Alert.alert(errorDialog.title, errorDialog.message, buttons, {cancelable: false})
      }
    },
    [buttons, scanErrorResolver, trigger],
  )

  return (
    <CameraCodeScanner
      ref={scannerRef}
      onRead={handleOnRead}
      onCameraPermissionDenied={navigateTo.showCameraPermissionDenied}
      withMask
    />
  )
}

type Params = ScanRoutes['scan-start']
const ScanStartParamsSchema = z.object({
  insideFeature: z.union([z.literal('scan'), z.literal('send')]),
})

const isScanStartParams = createTypeGuardFromSchema<Params>(ScanStartParamsSchema)
const isParams = (params?: unknown): params is Params => isScanStartParams(params)
