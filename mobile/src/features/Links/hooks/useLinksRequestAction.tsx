import {toBigInt} from '@yoroi/common'
import {linksCardanoModuleMaker, useLinks} from '@yoroi/links'
import {useTransfer} from '@yoroi/transfer'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {InteractionManager} from 'react-native'
import * as uuid from 'uuid'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {RequestedAdaPaymentWithLinkModal} from '../ui/modals/RequestedAdaPaymentWithLinkModal'
import {RequestedBrowserLaunchDappUrlModal} from '../ui/modals/RequestedBrowserLaunchDappUrlModal'
import {useNavigateTo} from './useNavigationTo'

const heightBreakpoint = 467

export const useLinksRequestAction = () => {
  const strings = useStrings()
  const {action, actionFinished} = useLinks()
  const {
    selected: {wallet},
  } = useWalletManager()
  const {closeModal, openModal} = useModal()
  const navigateTo = useNavigateTo()
  const {isLoggedIn} = useAuth()

  const processedActionRef = React.useRef<string | null>(null)

  const {addTabAndSetActive} = useBrowser()
  const {
    memoChanged,
    receiverResolveChanged,
    amountChanged,
    reset: resetTransfer,
    linkActionChanged,
  } = useTransfer()

  const startTransferWithLink = React.useCallback(
    (action: Links.YoroiAction, decimals: number) => {
      logger.debug('startTransferWithLink', {
        action,
        decimals,
        isLoggedIn,
        origin: 'useLinksRequestAction',
      })
      if (!isLoggedIn) return
      if (action.info.useCase === 'request/ada-with-link') {
        resetTransfer()
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
      linkActionChanged,
      memoChanged,
      closeModal,
      navigateTo,
      receiverResolveChanged,
      resetTransfer,
      wallet,
      isLoggedIn,
    ],
  )

  const openRequestedPaymentAdaWithLink = React.useCallback(
    (
      {
        params,
        isTrusted,
      }: {params: Links.TransferRequestAdaWithLinkParams; isTrusted: boolean},
      decimals: number,
    ) => {
      logger.debug('openRequestedPaymentAdaWithLink', {
        params,
        isTrusted,
        decimals,
        isLoggedIn,
        origin: 'useLinksRequestAction',
      })
      if (!isLoggedIn) return
      const title = isTrusted
        ? strings.links.trustedPaymentRequestedTitle
        : strings.links.untrustedPaymentRequestedTitle
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

      openModal({
        title: title,
        content: (
          <RequestedAdaPaymentWithLinkModal.Content
            params={params}
            isTrusted={isTrusted}
          />
        ),
        footer: (
          <RequestedAdaPaymentWithLinkModal.Footer
            onContinue={handleOnContinue}
          />
        ),
        height: heightBreakpoint,
      })
    },
    [
      strings.links.trustedPaymentRequestedTitle,
      strings.links.untrustedPaymentRequestedTitle,
      startTransferWithLink,
      openModal,
      isLoggedIn,
    ],
  )

  const launchDappUrl = React.useCallback(
    (action: Links.YoroiAction) => {
      logger.debug('useLinksRequestAction: launchDappUrl', {
        action,
        isLoggedIn,
        origin: 'useLinksRequestAction',
      })
      if (!isLoggedIn) return
      if (action.info.useCase === 'launch') {
        try {
          const dappUrl = decodeURIComponent(action.info.params.dappUrl)
          const redirectTo = action.info.params.redirectTo
          if (redirectTo != null) linkActionChanged(action)

          const id = uuid.v4()
          addTabAndSetActive(dappUrl, id)

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
    [
      actionFinished,
      addTabAndSetActive,
      linkActionChanged,
      closeModal,
      navigateTo,
      isLoggedIn,
    ],
  )

  const openRequestedBrowserLaunchDappUrl = React.useCallback(
    ({
      params,
      isTrusted,
    }: {
      params: Links.BrowserLaunchDappUrlParams
      isTrusted: boolean
    }) => {
      logger.debug('openRequestedBrowserLaunchDappUrl', {
        params,
        isTrusted,
        isLoggedIn,
        origin: 'useLinksRequestAction',
      })
      if (!isLoggedIn) return
      const title = isTrusted
        ? strings.links.trustedBrowserLaunchDappUrlTitle
        : strings.links.untrustedBrowserLaunchDappUrlTitle
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

      openModal({
        title: title,
        content: (
          <RequestedBrowserLaunchDappUrlModal.Content
            params={params}
            isTrusted={isTrusted}
          />
        ),
        footer: (
          <RequestedBrowserLaunchDappUrlModal.Footer
            onContinue={handleOnContinue}
          />
        ),
        height: heightBreakpoint,
      })
    },
    [
      launchDappUrl,
      openModal,
      strings.links.trustedBrowserLaunchDappUrlTitle,
      strings.links.untrustedBrowserLaunchDappUrlTitle,
      isLoggedIn,
    ],
  )

  const actionKey = React.useMemo(() => {
    if (action == null) return null
    const params = action.info.params
    let paramsKey = ''
    if ('link' in params) {
      paramsKey = `link:${params.link}`
    } else if ('dappUrl' in params) {
      paramsKey = `dappUrl:${params.dappUrl}`
    } else if ('redirectTo' in params) {
      paramsKey = `redirectTo:${params.redirectTo}`
    }
    return `${action.info.version}-${action.info.useCase}-${action.isTrusted}-${paramsKey}`
  }, [action])

  React.useEffect(() => {
    if (wallet == null || action == null) return

    if (processedActionRef.current === actionKey) return

    const handleAction = () => {
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
          logger.error(
            new Error(
              `useLinksRequestAction: unknown useCase: ${action?.info.useCase}`,
            ),
          )
          break
      }
      processedActionRef.current = actionKey
    }

    InteractionManager.runAfterInteractions(handleAction)
  }, [
    action,
    wallet,
    actionKey,
    openRequestedBrowserLaunchDappUrl,
    openRequestedPaymentAdaWithLink,
  ])

  React.useEffect(() => {
    if (action == null) {
      processedActionRef.current = null
    }
  }, [action])
}
