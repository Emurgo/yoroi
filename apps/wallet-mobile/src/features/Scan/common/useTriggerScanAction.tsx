import {useSend} from '../../../features/Send/common/SendContext'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {ScanAction, ScanFeature} from './types'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({insideFeature}: {insideFeature: ScanFeature}) => {
  const {receiverChanged, amountChanged, tokenSelectedChanged, resetForm, memoChanged} = useSend()
  const {primaryTokenInfo} = useSelectedWallet()
  const navigateTo = useNavigateTo()

  const trigger = (scanAction: ScanAction) => {
    switch (scanAction.action) {
      case 'send-single-pt': {
        navigateTo.back()
        navigateTo.send()

        if (insideFeature !== 'send') resetForm()

        receiverChanged(scanAction.receiver)

        if (scanAction.params) {
          if ('amount' in scanAction.params) {
            tokenSelectedChanged(primaryTokenInfo.id)
            amountChanged(
              Quantities.integer(
                asQuantity(pastedFormatter(scanAction.params?.amount?.toString() ?? '')),
                primaryTokenInfo.decimals ?? 0,
              ),
            )
          }
          if ('memo' in scanAction.params) memoChanged(scanAction.params?.memo ?? '')
        }
        break
      }

      case 'send-only-receiver': {
        navigateTo.back()
        navigateTo.send()

        if (insideFeature !== 'send') resetForm()

        receiverChanged(scanAction.receiver)
        break
      }

      case 'claim': {
        console.log('TODO: implement')
        break
      }
    }
  }

  return trigger
}
