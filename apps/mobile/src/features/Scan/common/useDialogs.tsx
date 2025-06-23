import * as React from 'react'

import {useStrings} from './useStrings'

export const useDialogs = () => {
  const strings = useStrings()

  return React.useRef({
    cameraPermissionDenied: {
      title: strings.cameraPermissionDeniedTitle,
      message: strings.cameraPermissionDeniedHelp,
    },

    errorUnknown: {
      title: strings.errorUnknownTitle,
      message: strings.errorUnknownHelp,
    },
    errorUnknownContent: {
      title: strings.errorUnknownContentTitle,
      message: strings.errorUnknownContentHelp,
    },

    linksErrorExtraParamsDenied: {
      title: strings.linksErrorExtraParamsDeniedTitle,
      message: strings.linksErrorExtraParamsDeniedHelp,
    },
    linksErrorForbiddenParamsProvided: {
      title: strings.linksErrorForbiddenParamsProvidedTitle,
      message: strings.linksErrorForbiddenParamsProvidedHelp,
    },
    linksErrorRequiredParamsMissing: {
      title: strings.linksErrorRequiredParamsMissingTitle,
      message: strings.linksErrorRequiredParamsMissingHelp,
    },
    linksErrorParamsValidationFailed: {
      title: strings.linksErrorParamsValidationFailedTitle,
      message: strings.linksErrorParamsValidationFailedHelp,
    },
    linksErrorUnsupportedAuthority: {
      title: strings.linksErrorUnsupportedAuthorityTitle,
      message: strings.linksErrorUnsupportedAuthorityHelp,
    },
    linksErrorUnsupportedVersion: {
      title: strings.linksErrorUnsupportedVersionTitle,
      message: strings.linksErrorUnsupportedVersionHelp,
    },
    linksErrorSchemeNotImplemented: {
      title: strings.linksErrorSchemeNotImplementedTitle,
      message: strings.linksErrorSchemeNotImplementedHelp,
    },
  } as const).current
}
