import {Claim} from '@yoroi/types'

import {useApiErrorResolver} from '../../../hooks/useApiErrorResolver'
import {useDialogs} from './useDialogs'

export const useClaimErrorResolver = () => {
  const dialogs = useDialogs()
  const apiResolver = useApiErrorResolver()

  const resolver = (error: unknown) => {
    if (error instanceof Claim.Api.Errors.AlreadyClaimed) return dialogs.errorAlreadyClaimed
    if (error instanceof Claim.Api.Errors.Expired) return dialogs.errorExpired
    if (error instanceof Claim.Api.Errors.InvalidRequest) return dialogs.errorInvalidRequest
    if (error instanceof Claim.Api.Errors.NotFound) return dialogs.errorNotFound
    if (error instanceof Claim.Api.Errors.RateLimited) return dialogs.errorRateLimited
    if (error instanceof Claim.Api.Errors.TooEarly) return dialogs.errorTooEarly

    // falback to api errors
    return apiResolver(error)
  }

  return resolver
}
