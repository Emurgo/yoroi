import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {isEmptyString} from '../../../kernel/utils'
import {AskToRedirectScreen} from '../useCases/AskToRedirect/AskToRedirectScreen'
import {useStrings} from './useStrings'

const heightBreakpoint = 367
export const useLinksRequestRedirect = (redirectTo?: string) => {
  const strings = useStrings()
  const {openModal} = useModal()

  const askToRedirect = React.useCallback(
    (link: string) => {
      const content = <AskToRedirectScreen link={link} />
      openModal(strings.askToRedirectTitle, content, heightBreakpoint)
    },
    [openModal, strings.askToRedirectTitle],
  )

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (!isEmptyString(redirectTo)) askToRedirect(decodeURIComponent(redirectTo))
    })
  }, [redirectTo, askToRedirect])
}
