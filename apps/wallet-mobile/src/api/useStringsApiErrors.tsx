import * as React from 'react'
import {useIntl} from 'react-intl'

import {apiErrors} from '../i18n/global-messages'

export const useStringsApiErrors = () => {
  const intl = useIntl()

  return React.useRef({
    errorTitle: intl.formatMessage(apiErrors.title),

    badRequest: intl.formatMessage(apiErrors.badRequest),
    conflict: intl.formatMessage(apiErrors.conflict),
    forbidden: intl.formatMessage(apiErrors.forbidden),
    gone: intl.formatMessage(apiErrors.gone),
    invalidState: intl.formatMessage(apiErrors.invalidState),
    network: intl.formatMessage(apiErrors.network),
    notFound: intl.formatMessage(apiErrors.notFound),
    responseMalformed: intl.formatMessage(apiErrors.responseMalformed),
    serverSide: intl.formatMessage(apiErrors.serverSide),
    tooEarly: intl.formatMessage(apiErrors.tooEarly),
    tooManyRequests: intl.formatMessage(apiErrors.tooManyRequests),
    unauthorized: intl.formatMessage(apiErrors.unauthorized),
    unknown: intl.formatMessage(apiErrors.unknown),
  } as const).current
}
