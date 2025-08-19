import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/ModalContext'
import {isEmptyString} from '~/wallets/utils/string'

import {AskToRedirectScreen} from '../useCases/AskToRedirect/AskToRedirectScreen'

const heightBreakpoint = 367
export const useLinksRequestRedirect = (redirectTo?: string) => {
  const strings = useStrings()
  const {openModal} = useModal()

  const askToRedirect = React.useCallback(
    (link: string) => {
      openModal({
        title: strings.links.askToRedirectTitle,
        content: <AskToRedirectScreen link={link} />,
        height: heightBreakpoint,
      })
    },
    [openModal, strings.links.askToRedirectTitle],
  )

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (!isEmptyString(redirectTo))
        askToRedirect(decodeURIComponent(redirectTo ?? ''))
    })
  }, [redirectTo, askToRedirect])
}
