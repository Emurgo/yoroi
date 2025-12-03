import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'

import * as React from 'react'
import {InteractionManager} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {AskToRedirectModal} from '../ui/modals/AskToRedirectModal'

const heightBreakpoint = 367
export const useLinksRequestRedirect = (redirectTo?: string) => {
  const strings = useStrings()
  const {openModal} = useModal()

  const askToRedirect = React.useCallback(
    (link: string) => {
      openModal({
        title: strings.links.askToRedirectTitle,
        content: <AskToRedirectModal.Content />,
        height: heightBreakpoint,
        footer: <AskToRedirectModal.Footer link={link} />,
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
