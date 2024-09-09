import {useClaim, useClaimTokens} from '@yoroi/claim'
import {toBigInt} from '@yoroi/common'
import {useTransfer} from '@yoroi/transfer'
import {Scan} from '@yoroi/types'
import * as React from 'react'
import {Alert} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useClaimErrorResolver} from '../../../features/Claim/common/useClaimErrorResolver'
import {useStrings as useStringsClaim} from '../../../features/Claim/common/useStrings'
import {AskConfirmation} from '../../../features/Claim/useCases/AskConfirmation'
import {pastedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({insideFeature}: {insideFeature: Scan.Feature}) => {
  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const {openModal, closeModal, startLoading, stopLoading} = useModal()
  const navigateTo = useNavigateTo()

  const {
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    reset: resetTransferState,
    memoChanged,
  } = useTransfer()

  const {reset: resetClaimState, scanActionClaimChanged, address, claimInfoChanged} = useClaim()
  const claimErrorResolver = useClaimErrorResolver()
  const {claimTokens} = useClaimTokens({
    onSuccess: (claimInfo) => {
      claimInfoChanged(claimInfo)
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

  const trigger = (scanAction: Scan.Action) => {
    switch (scanAction.action) {
      case 'send-single-pt': {
        if (insideFeature !== 'send') resetTransferState()

        receiverResolveChanged(scanAction.receiver)

        if (scanAction.params) {
          if ('amount' in scanAction.params) {
            tokenSelectedChanged(portfolioPrimaryTokenInfo.id)
            amountChanged({
              info: portfolioPrimaryTokenInfo,
              quantity: toBigInt(
                pastedFormatter(scanAction.params?.amount?.toString() ?? ''),
                portfolioPrimaryTokenInfo.decimals,
              ),
            })
          }
          if ('memo' in scanAction.params) memoChanged(scanAction.params?.memo ?? '')
        }

        navigateTo.startTransfer()
        break
      }

      case 'send-only-receiver': {
        if (insideFeature !== 'send') resetTransferState()

        receiverResolveChanged(scanAction.receiver)

        navigateTo.startTransfer()
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
