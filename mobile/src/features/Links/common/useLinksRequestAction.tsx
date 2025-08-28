import {toBigInt} from '@yoroi/common'
import {linksCardanoModuleMaker, useLinks} from '@yoroi/links'
import {useTransfer} from '@yoroi/transfer'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {InteractionManager} from 'react-native'
import * as uuid from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useMetrics} from '~/kernel/metrics/metricsManager'

import {RequestedAdaPaymentWithLinkScreen} from '../useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen'
import {RequestedBrowserLaunchDappUrlScreen} from '../useCases/RequestedBrowserLaunchDappUrlScreen/RequestedBrowserLaunchDappUrlScreen'
import {useNavigateTo} from './useNavigationTo'

const heightBreakpoint = 467

type ModalFunctions = {
  openModal: (args: {
    content: React.ReactNode
    height?: number
    footer?: React.ReactNode
    isLoading?: boolean
    canDiscard?: boolean
    title?: string
    canContinue?: boolean
    onClose?: () => void
    resizable?: boolean
  }) => void
  closeModal: () => void
}

export const useLinksRequestAction = (modalFunctions?: ModalFunctions) => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {action, actionFinished} = useLinks()
  const {
    selected: {wallet},
  } = useWalletManager()
  const navigateTo = useNavigateTo()

  const processedActionRef = React.useRef<string | null>(null)

  const {addTab, setTabActive, tabs} = useBrowser()
  const {
    memoChanged,
    receiverResolveChanged,
    amountChanged,
    reset,
    linkActionChanged,
  } = useTransfer()

  const startTransferWithLink = React.useCallback(
    (action: Links.YoroiAction, decimals: number) => {
      logger.debug('useLinksRequestAction: startTransferWithLink', {
        action,
        decimals,
      })
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
              modalFunctions?.closeModal()
              actionFinished()
              navigateTo.startTransfer()
            }
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          modalFunctions?.closeModal()
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
      modalFunctions,
      navigateTo,
      receiverResolveChanged,
      reset,
      wallet,
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
      if (!modalFunctions) {
        // Fallback: directly start transfer without modal
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
        return
      }

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

      const content = (
        <RequestedAdaPaymentWithLinkScreen
          onContinue={handleOnContinue}
          params={params}
          isTrusted={isTrusted}
          onClose={modalFunctions.closeModal}
        />
      )

      modalFunctions.openModal({
        title: title,
        content: content,
        height: heightBreakpoint,
      })
    },
    [
      strings.links.trustedPaymentRequestedTitle,
      strings.links.untrustedPaymentRequestedTitle,
      startTransferWithLink,
      modalFunctions,
    ],
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
          track.discoverConnectedBottomSheetOpenDAppClicked()

          const id = uuid.v4()
          addTab(dappUrl, id)
          setTabActive(tabs.length)

          modalFunctions?.closeModal()
          actionFinished()
          navigateTo.launchDappUrl()
        } catch (error) {
          // TODO: revisit it should display an alert
          modalFunctions?.closeModal()
          actionFinished()
          logger.error('Error parsing Yoroi link', {error})
        }
      }
    },
    [
      actionFinished,
      addTab,
      linkActionChanged,
      modalFunctions,
      navigateTo,
      setTabActive,
      tabs,
      track,
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
      if (!modalFunctions) {
        launchDappUrl({
          info: {
            version: 1,
            feature: 'browser',
            useCase: 'launch',
            params,
          },
          isTrusted,
        })
        return
      }

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

      const content = (
        <RequestedBrowserLaunchDappUrlScreen
          onContinue={handleOnContinue}
          params={params}
          isTrusted={isTrusted}
        />
      )

      modalFunctions.openModal({
        title: title,
        content: content,
        height: heightBreakpoint,
      })
    },
    [
      launchDappUrl,
      modalFunctions,
      strings.links.trustedBrowserLaunchDappUrlTitle,
      strings.links.untrustedBrowserLaunchDappUrlTitle,
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
    processedActionRef.current = null
  }, [action])
}
