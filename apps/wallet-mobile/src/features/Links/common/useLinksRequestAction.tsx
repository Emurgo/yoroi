import {toBigInt} from '@yoroi/common'
import {linksCardanoModuleMaker, useLinks} from '@yoroi/links'
import {useTransfer} from '@yoroi/transfer'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {logger} from '../../../kernel/logger/logger'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {RequestedAdaPaymentWithLinkScreen} from '../useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen'
import {RequestedBrowserLaunchDappUrlScreen} from '../useCases/RequestedBrowserLaunchDappUrlScreen/RequestedBrowserLaunchDappUrlScreen'
import {useNavigateTo} from './useNavigationTo'
import {useStrings} from './useStrings'

const heightBreakpoint = 467
export const useLinksRequestAction = () => {
  const strings = useStrings()
  const {action, actionFinished} = useLinks()
  const {openModal, closeModal} = useModal()
  const {
    selected: {wallet},
  } = useWalletManager()
  const navigateTo = useNavigateTo()

  const {memoChanged, receiverResolveChanged, amountChanged, reset, linkActionChanged} = useTransfer()

  const startTransferWithLink = React.useCallback(
    (action: Links.YoroiAction, decimals: number) => {
      logger.debug('useLinksRequestAction: startTransferWithLink', {action, decimals})
      if (action.info.useCase === 'request/ada-with-link') {
        reset()
        try {
          const link = decodeURIComponent(action.info.params.link)
          if (wallet) {
            const parsedCardanoLink = linksCardanoModuleMaker().parse(link)
            if (parsedCardanoLink) {
              const redirectTo = action.info.params.redirectTo
              if (redirectTo != null) linkActionChanged(action)

              const {address: receiver, amount, memo} = parsedCardanoLink.params
              const ptAmount = toBigInt(amount, decimals)
              memoChanged(memo ?? '')
              receiverResolveChanged(receiver ?? '')
              amountChanged({
                quantity: ptAmount,
                info: wallet.portfolioPrimaryTokenInfo,
              })
              closeModal()
              actionFinished()
              navigateTo.startTransfer()
            }
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing Cardano link', {error})
        }
      }
    },
    [
      actionFinished,
      amountChanged,
      closeModal,
      linkActionChanged,
      memoChanged,
      navigateTo,
      receiverResolveChanged,
      reset,
      wallet,
    ],
  )

  const openRequestedPaymentAdaWithLink = React.useCallback(
    ({params, isTrusted}: {params: Links.TransferRequestAdaWithLinkParams; isTrusted: boolean}, decimals: number) => {
      const title = isTrusted ? strings.trustedPaymentRequestedTitle : strings.untrustedPaymentRequestedTitle
      const handleOnContinue = () =>
        startTransferWithLink(
          {
            info: {
              version: 1,
              feature: 'transfer',
              useCase: 'request/ada-with-link',
              params,
            },
            isTrusted,
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

  const launchDappUrl = React.useCallback(
    (action: Links.YoroiAction) => {
      logger.debug('useLinksRequestAction: launchDappUrl', {action})
      if (action.info.useCase === 'launch') {
        try {
          const dappUrl = decodeURIComponent(action.info.params.dappUrl)
          const redirectTo = action.info.params.redirectTo
          if (redirectTo != null) linkActionChanged(action)

          logger.debug('useLinksRequestAction: launchDappUrl', {dappUrl})

          closeModal()
          actionFinished()
          navigateTo.launchDappUrl()
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing Yoroi link', {error})
        }
      }
    },
    [actionFinished, closeModal, linkActionChanged, navigateTo],
  )

  const openRequestedBrowserLaunchDappUrl = React.useCallback(
    ({params, isTrusted}: {params: Links.BrowserLaunchDappUrlParams; isTrusted: boolean}) => {
      const title = isTrusted ? strings.trustedBrowserLaunchDappUrlTitle : strings.untrustedBrowserLaunchDappUrlTitle
      const handleOnContinue = () =>
        launchDappUrl({
          info: {
            version: 1,
            feature: 'browser',
            useCase: 'launch',
            params,
          },
          isTrusted,
        })

      const content = (
        <RequestedBrowserLaunchDappUrlScreen onContinue={handleOnContinue} params={params} isTrusted={isTrusted} />
      )

      openModal(title, content, heightBreakpoint)
    },
    [launchDappUrl, openModal, strings.trustedBrowserLaunchDappUrlTitle, strings.untrustedBrowserLaunchDappUrlTitle],
  )

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (wallet != null && action != null) {
        switch (action.info.useCase) {
          case 'request/ada-with-link':
            openRequestedPaymentAdaWithLink(
              {params: action.info.params, isTrusted: action.isTrusted},
              wallet.portfolioPrimaryTokenInfo.decimals,
            )
            break
          case 'launch':
            openRequestedBrowserLaunchDappUrl({
              params: action.info.params,
              isTrusted: action.isTrusted,
            })
            break
          default:
            logger.error(new Error(`useLinksRequestAction: unknown useCase: ${action?.info.useCase}`))
            break
        }
      }
    })
  }, [action, openRequestedBrowserLaunchDappUrl, openRequestedPaymentAdaWithLink, wallet])
}
