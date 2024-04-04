import {useLinks} from '@yoroi/links'
import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useSelectedWalletContext} from '../../AddWallet/common/Context'
import {AskToOpenWalletScreen} from '../useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen'
import {useStrings} from './useStrings'

const heightBreakpoint = 367
export const useLinksRequestWallet = () => {
  const strings = useStrings()
  const {openModal} = useModal()
  const [wallet] = useSelectedWalletContext()
  const {action} = useLinks()

  const askToOpenAWallet = React.useCallback(() => {
    const content = <AskToOpenWalletScreen />
    openModal(strings.askToOpenAWalletTitle, content, heightBreakpoint)
  }, [openModal, strings.askToOpenAWalletTitle])

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const isWalletRequested = action?.info.useCase === 'request/ada-with-link' && wallet == null
      if (isWalletRequested) askToOpenAWallet()
    })
  }, [askToOpenAWallet, action?.info.useCase, wallet])
}
