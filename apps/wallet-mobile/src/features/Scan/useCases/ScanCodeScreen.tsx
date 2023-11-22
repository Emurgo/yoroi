import {BarCodeScannerResult} from 'expo-barcode-scanner'
import * as React from 'react'
import {Alert, AlertButton, StatusBar} from 'react-native'

import {CameraCodeScanner, CameraCodeScannerMethods} from '../../../components/CameraCodeScanner/CameraCodeScanner'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import * as feedback from '../../../utils/feedback'
import {pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {useSend} from '../../Send/common/SendContext'
import {parseScanAction} from '../common/parsers'
import {ScanAction} from '../common/types'
import {useNavigateTo} from '../common/useNavigateTo'
import {useScanErrorResolver} from '../common/useScanErrorResolver'
import {useStrings} from '../common/useStrings'

export const ScanCodeScreen = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const scannerRef = React.useRef<CameraCodeScannerMethods>(null)
  const [buttons] = React.useState<AlertButton[]>([
    {text: strings.ok, onPress: () => scannerRef.current?.continueScanning()},
  ])
  const scanErrorResolver = useScanErrorResolver()
  const {trigger} = useScanAction()

  const handleOnRead = React.useCallback(
    (event: BarCodeScannerResult) => {
      scannerRef.current?.stopScanning()
      const {data: codeContent} = event

      try {
        const parsedScanAction = parseScanAction(codeContent)
        feedback.success()

        return trigger(parsedScanAction)
      } catch (error) {
        const errorDialog = scanErrorResolver(error as Error)
        Alert.alert(errorDialog.title, errorDialog.message, buttons, {cancelable: false})
      }
    },
    [buttons, scanErrorResolver, trigger],
  )

  return (
    <>
      <StatusBar hidden />

      <CameraCodeScanner
        ref={scannerRef}
        onRead={handleOnRead}
        onCameraPermissionDenied={navigateTo.showCameraPermissionDenied}
        withMask
      />
    </>
  )
}

const useScanAction = () => {
  const {receiverChanged, amountChanged, tokenSelectedChanged, resetForm, memoChanged} = useSend()
  const {primaryTokenInfo} = useSelectedWallet()
  const navigateTo = useNavigateTo()

  const trigger = (scanAction: ScanAction) => {
    switch (scanAction.action) {
      case 'send-single-pt': {
        navigateTo.back()
        navigateTo.send()
        resetForm()
        receiverChanged(scanAction.receiver)
        tokenSelectedChanged(primaryTokenInfo.id)
        amountChanged(
          Quantities.integer(
            asQuantity(pastedFormatter(scanAction.params?.amount?.toString() ?? '')),
            primaryTokenInfo.decimals ?? 0,
          ),
        )
        memoChanged(scanAction.params?.memo ?? '')
        break
      }
      case 'send-only-receiver': {
        navigateTo.back()
        navigateTo.send()
        resetForm()
        receiverChanged(scanAction.receiver)
        navigateTo.send()
        break
      }
      case 'claim': {
        console.log('TODO: implement')
        break
      }
    }
  }

  return {trigger}
}
