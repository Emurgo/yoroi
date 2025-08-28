import {useLinks} from '@yoroi/links'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'

import {AskToOpenWalletScreen} from '../useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen'

const heightBreakpoint = 367

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

export const useLinksRequestWallet = (modalFunctions?: ModalFunctions) => {
  const strings = useStrings()
  const {
    selected: {wallet},
  } = useWalletManager()
  const {action} = useLinks()

  const askToOpenAWallet = React.useCallback(() => {
    if (!modalFunctions) {
      logger.debug('useLinksRequestWallet: modal functions not available')
      return
    }

    modalFunctions.openModal({
      title: strings.links.askToOpenAWalletTitle,
      content: <AskToOpenWalletScreen />,
      height: heightBreakpoint,
    })
  }, [modalFunctions, strings.links.askToOpenAWalletTitle])

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const isWalletRequested =
        action?.info.useCase === 'request/ada-with-link' ||
        action?.info.useCase === 'launch'
      if (isWalletRequested && wallet == null) {
        askToOpenAWallet()
      }
    })
  }, [askToOpenAWallet, action?.info.useCase, wallet])
}
