import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {Alert} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useClaimErrorResolver} from '../../../features/Claim/common/useClaimErrorResolver'
import {useStrings as useStringsClaim} from '../../../features/Claim/common/useStrings'
import {useClaim} from '../../../features/Claim/module/ClaimProvider'
import {useClaimTokens} from '../../../features/Claim/module/useClaimTokens'
import {AskConfirmation} from '../../../features/Claim/useCases/AskConfirmation'
import {useSelectedWallet} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {ScanAction, ScanFeature} from './types'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({insideFeature}: {insideFeature: ScanFeature}) => {
  const {primaryTokenInfo} = useSelectedWallet()
  const {openModal, closeModal, startLoading, stopLoading} = useModal()
  const navigateTo = useNavigateTo()

  const {
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    reset: resetTransferState,
    memoChanged,
  } = useTransfer()

  const {reset: resetClaimState, scanActionClaimChanged, address, claimTokenChanged} = useClaim()
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

        if (insideFeature !== 'send') resetTransferState()

        receiverResolveChanged(scanAction.receiver)

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

        navigateTo.back()
        navigateTo.send()
        break
      }

      case 'send-only-receiver': {
        if (insideFeature !== 'send') resetTransferState()
        
        receiverResolveChanged(scanAction.receiver)

        navigateTo.back()
        navigateTo.send()
        break
      }

      case 'claim': {
        navigateTo.back()
        resetClaimState()
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
