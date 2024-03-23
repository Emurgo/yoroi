import {LinksTransferRequestAdaWithLinkParams, useLinks} from '@yoroi/links'
import * as React from 'react'
import {Keyboard} from 'react-native'

import {useModal} from '../../../components/Modal/ModalContext'
import {RequestedAdaPaymentWithLinkScreen} from '../useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen'
import {useStrings} from './useStrings'

const heightBreakpoint = 467
export const useLinksRequestAction = () => {
  const strings = useStrings()

  const {action} = useLinks()
  const {openModal} = useModal()

  const openRequestedPaymentAdaWithLink = React.useCallback(
    ({params, isTrusted}: {params: LinksTransferRequestAdaWithLinkParams; isTrusted?: boolean}) => {
      Keyboard.dismiss()
      const title = isTrusted ? strings.trustedPaymentRequestedTitle : strings.untrustedPaymentRequestedTitle

      const content = <RequestedAdaPaymentWithLinkScreen params={params} isTrusted={isTrusted} />

      openModal(title, content, heightBreakpoint)
    },
    [strings.trustedPaymentRequestedTitle, strings.untrustedPaymentRequestedTitle, openModal],
  )

  React.useEffect(() => {
    if (action?.info.useCase === 'request/ada-with-link') {
      openRequestedPaymentAdaWithLink({params: action.info.params, isTrusted: action.isTrusted})
    }
  }, [action?.info.params, action?.info.useCase, action?.isTrusted, openRequestedPaymentAdaWithLink])
}
