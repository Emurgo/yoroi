import {linksCardanoModuleMaker, LinksTransferRequestAdaWithLinkParams, LinksYoroiAction, useLinks} from '@yoroi/links'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'
import {InteractionManager, Keyboard} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useSelectedWalletContext} from '../../../SelectedWallet'
import {Logger} from '../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../yoroi-wallets/utils/utils'
import {RequestedAdaPaymentWithLinkScreen} from '../useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen'
import {useNavigateTo} from './useNavigationTo'
import {useStrings} from './useStrings'

const heightBreakpoint = 467
export const useLinksRequestAction = () => {
  const strings = useStrings()
  const {action, actionFinished} = useLinks()
  const {openModal, closeModal} = useModal()
  const [wallet] = useSelectedWalletContext()
  const navigateTo = useNavigateTo()

  const {memoChanged, receiverResolveChanged, amountChanged, reset} = useTransfer()
  const startTransferWithLink = React.useCallback(
    (action: LinksYoroiAction, decimals: number) => {
      Logger.debug('startTransferWithLink', action, decimals)
      if (action.info.useCase === 'request/ada-with-link') {
        reset()
        try {
          const link = decodeURIComponent(action.info.params.link)
          const parsedCardanoLink = linksCardanoModuleMaker().parse(link)
          if (parsedCardanoLink) {
            const {address: receiver, amount, memo} = parsedCardanoLink.params
            const ptAmount = Quantities.integer(asQuantity(amount ?? 0), decimals)
            memoChanged(memo ?? '')
            receiverResolveChanged(receiver ?? '')
            amountChanged(ptAmount)
            closeModal()
            actionFinished()
            navigateTo.startTransfer()
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          Logger.error('Error parsing Cardano link', error)
        }
      }
    },
    [actionFinished, amountChanged, closeModal, memoChanged, navigateTo, receiverResolveChanged, reset],
  )

  const openRequestedPaymentAdaWithLink = React.useCallback(
    ({params, isTrusted}: {params: LinksTransferRequestAdaWithLinkParams; isTrusted: boolean}, decimals: number) => {
      Keyboard.dismiss()
      const title = isTrusted ? strings.trustedPaymentRequestedTitle : strings.untrustedPaymentRequestedTitle
      const handleOnContinue = () =>
        startTransferWithLink(
          {
            info: {
              version: 1,
              feature: 'transfer',
              useCase: 'request/ada-with-link',
              params: params,
            },
            isTrusted: isTrusted,
          },
          decimals,
        )

      const content = (
        <RequestedAdaPaymentWithLinkScreen onContinue={handleOnContinue} params={params} isTrusted={isTrusted} />
      )

      openModal(title, content, heightBreakpoint)
    },
    [strings.trustedPaymentRequestedTitle, strings.untrustedPaymentRequestedTitle, startTransferWithLink, openModal],
  )

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (action?.info.useCase === 'request/ada-with-link' && wallet != null) {
        openRequestedPaymentAdaWithLink(
          {params: action.info.params, isTrusted: action.isTrusted},
          wallet.primaryTokenInfo.decimals ?? 0,
        )
      }
    })
  }, [action?.info.params, action?.info.useCase, action?.isTrusted, openRequestedPaymentAdaWithLink, wallet])
}
