import {useApiErrorResolver} from '../../../api/useApiErrorResolver'
import {
  ClaimApiErrorsAlreadyClaimed,
  ClaimApiErrorsExpired,
  ClaimApiErrorsInvalidRequest,
  ClaimApiErrorsNotFound,
  ClaimApiErrorsRateLimited,
  ClaimApiErrorsTooEarly,
} from '../module/errors'
import {useDialogs} from './useDialogs'

export const useClaimErrorResolver = () => {
  const dialogs = useDialogs()
  const apiResolver = useApiErrorResolver()

  const resolver = (error: unknown) => {
    if (error instanceof ClaimApiErrorsAlreadyClaimed) return dialogs.errorAlreadyClaimed
    if (error instanceof ClaimApiErrorsExpired) return dialogs.errorExpired
    if (error instanceof ClaimApiErrorsInvalidRequest) return dialogs.errorInvalidRequest
    if (error instanceof ClaimApiErrorsNotFound) return dialogs.errorNotFound
    if (error instanceof ClaimApiErrorsRateLimited) return dialogs.errorRateLimited
    if (error instanceof ClaimApiErrorsTooEarly) return dialogs.errorTooEarly

    // falback to api errors
    return apiResolver(error)
  }

  return resolver
}
