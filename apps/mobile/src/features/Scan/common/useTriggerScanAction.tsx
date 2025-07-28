import {useClaim, useClaimTokens} from '@yoroi/claim'
import {toBigInt} from '@yoroi/common'
import {useTransfer} from '@yoroi/transfer'
import {Scan} from '@yoroi/types'
import * as React from 'react'
import {Alert, Linking} from 'react-native'

import {useClaimErrorResolver} from '~/features/Claim/common/useClaimErrorResolver'
import {useStrings as useStringsClaim} from '~/features/Claim/common/useStrings'
import {
  AskConfirmation,
  AskConfirmationActions,
} from '~/features/Claim/useCases/AskConfirmation'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useModal} from '~/ui/Modal/ModalContext'
import {pastedFormatter} from '~/wallets/utils/amountUtils'
import {useNavigateTo} from './useNavigateTo'

export const useTriggerScanAction = ({
  insideFeature,
}: {
  insideFeature: Scan.Feature
}) => {
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

  const {
    reset: resetClaimState,
    scanActionClaimChanged,
    address,
    claimInfoChanged,
  } = useClaim()
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
      case 'launch-url': {
        Linking.openURL(scanAction.url)
        break
      }

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
          if ('memo' in scanAction.params)
            memoChanged(scanAction.params?.memo ?? '')
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

        openModal({
          title: stringsClaim.askConfirmationTitle,
          content: (
            <AskConfirmation
              address={address}
              url={scanAction.url}
              code={scanAction.code}
            />
          ),
          footer: <AskConfirmationActions onContinue={handleOnContinue} />,
          height: 400,
        })
        break
      }
    }
  }

  return trigger
}
