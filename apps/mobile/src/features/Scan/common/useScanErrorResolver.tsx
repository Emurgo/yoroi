import {Links, Scan} from '@yoroi/types'

import {useDialogs} from './useDialogs'

export const useScanErrorResolver = () => {
  const dialogs = useDialogs()

  const resolver = (error: unknown) => {
    if (error instanceof Scan.Errors.UnknownContent) return dialogs.errorUnknownContent
    if (error instanceof Links.Errors.ExtraParamsDenied) return dialogs.linksErrorExtraParamsDenied
    if (error instanceof Links.Errors.ForbiddenParamsProvided) return dialogs.linksErrorForbiddenParamsProvided
    if (error instanceof Links.Errors.RequiredParamsMissing) return dialogs.linksErrorRequiredParamsMissing
    if (error instanceof Links.Errors.ParamsValidationFailed) return dialogs.linksErrorParamsValidationFailed
    if (error instanceof Links.Errors.UnsupportedAuthority) return dialogs.linksErrorUnsupportedAuthority
    if (error instanceof Links.Errors.UnsupportedVersion) return dialogs.linksErrorUnsupportedVersion
    if (error instanceof Links.Errors.SchemeNotImplemented) return dialogs.linksErrorSchemeNotImplemented
    return dialogs.errorUnknown
  }

  return resolver
}
