import {useLinks} from '@yoroi/links'
import * as React from 'react'
import {Keyboard} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {useSelectedWalletContext} from '../../../SelectedWallet'
import {AskToOpenWalletScreen} from '../useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen'
import {useStrings} from './useStrings'

const heightBreakpoint = 467
export const useLinksRequestWallet = () => {
  const strings = useStrings()
  const {openModal} = useModal()
  const [wallet] = useSelectedWalletContext()
  const {action} = useLinks()
  const isWalletRequested = action?.info.useCase === 'request/ada-with-link' && wallet == null
  console.log('isWalletRequested', isWalletRequested)

  const askToOpenAWallet = React.useCallback(() => {
    Keyboard.dismiss()
    const content = <AskToOpenWalletScreen />
    openModal(strings.askToOpenAWalletTitle, content, heightBreakpoint)
  }, [openModal, strings.askToOpenAWalletTitle])

  React.useEffect(() => {
    if (isWalletRequested) askToOpenAWallet()
  }, [isWalletRequested, askToOpenAWallet])
}
