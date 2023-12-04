import * as React from 'react'
import {Alert} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useClaimErrorResolver} from '../../../features/Claim/common/useClaimErrorResolver'
import {useStrings as useStringsClaim} from '../../../features/Claim/common/useStrings'
import {useClaim} from '../../../features/Claim/module/ClaimProvider'
import {useClaimTokens} from '../../../features/Claim/module/useClaimTokens'
import {AskConfirmation} from '../../../features/Claim/useCases/AskConfirmation'
import {useSend} from '../../../features/Send/common/SendContext'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {ScanAction, ScanFeature} from './types'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({insideFeature}: {insideFeature: ScanFeature}) => {
  const {primaryTokenInfo} = useSelectedWallet()
  const {openModal, closeModal, startLoading, stopLoading} = useModal()
  const navigateTo = useNavigateTo()

  const {receiverChanged, amountChanged, tokenSelectedChanged, resetForm, memoChanged} = useSend()

  const {reset, scanActionClaimChanged, address, claimTokenChanged} = useClaim()
  const claimErrorResolver = useClaimErrorResolver()
  const {claimTokens} = useClaimTokens({
    onSuccess: (claimToken) => {
      claimTokenChanged(claimToken)
      closeModal()
      navigateTo.claimShowSuccess()
    },
    onError: (error) => {
      stopLoading()
      const claimErrorDialog = claimErrorResolver(error)
      Alert.alert(claimErrorDialog.title, claimErrorDialog.message)
    },
  })
  const stringsClaim = useStringsClaim()

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
        navigateTo.back()
        reset()
        scanActionClaimChanged(scanAction)

        const handleOnContinue = () => {
          startLoading()
          claimTokens(scanAction)
        }
        const claimContent = (
          <AskConfirmation
            address={address}
            url={scanAction.url}
            code={scanAction.code}
            onContinue={handleOnContinue}
          />
        )

        openModal(stringsClaim.askConfirmationTitle, claimContent, 400)

        break
      }
    }
  }

  return trigger
}
