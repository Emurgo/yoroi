import {useLinks} from '@yoroi/links'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/ModalContext'

import {AskToOpenWalletScreen} from '../useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen'

const heightBreakpoint = 367
export const useLinksRequestWallet = () => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {
    selected: {wallet},
  } = useWalletManager()
  const {action} = useLinks()

  const askToOpenAWallet = React.useCallback(() => {
    openModal({
      title: strings.links.askToOpenAWalletTitle,
      content: <AskToOpenWalletScreen />,
      height: heightBreakpoint,
    })
  }, [openModal, strings.links.askToOpenAWalletTitle])

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const isWalletRequested =
        action?.info.useCase === 'request/ada-with-link' ||
        action?.info.useCase === 'launch'
      if (isWalletRequested && wallet == null) askToOpenAWallet()
    })
  }, [askToOpenAWallet, action?.info.useCase, wallet])
}
