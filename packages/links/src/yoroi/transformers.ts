import {linksCardanoModuleMaker} from '../cardano/module'
import {
  ExchangeShowCreateResultSchema,
  TransferRequestAdaSchema,
  TransferRequestAdaWithLinkSchema,
  isUnsafeUrl,
} from './validators'

export const encodeExchangeShowCreateResult =
  ExchangeShowCreateResultSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null && isUnsafeUrl(toCheck.redirectTo))
      return false

    return true
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: encodeURIComponent(toTransform.redirectTo),
      }
    }
    return toTransform
  })
export const decodeExchangeShowCreateResult =
  ExchangeShowCreateResultSchema.refine((toCheck) => {
    if (
      toCheck.redirectTo != null &&
      isUnsafeUrl(decodeURIComponent(toCheck.redirectTo))
    )
      return false

    return true
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: decodeURIComponent(toTransform.redirectTo),
      }
    }
    return toTransform
  })

export const encodeTransferRequestAdaWithLink =
  TransferRequestAdaWithLinkSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null && isUnsafeUrl(toCheck.redirectTo))
      return false

    try {
      linksCardanoModuleMaker().parse(toCheck.link)
      return true
    } catch {
      return false
    }
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: encodeURIComponent(toTransform.redirectTo),
        link: encodeURIComponent(toTransform.link),
      }
    }
    return {
      ...toTransform,
      link: encodeURIComponent(toTransform.link),
    }
  })

export const decodeTransferRequestAdaWithLink =
  TransferRequestAdaWithLinkSchema.refine((toCheck) => {
    if (
      toCheck.redirectTo != null &&
      isUnsafeUrl(decodeURIComponent(toCheck.redirectTo))
    )
      return false

    try {
      linksCardanoModuleMaker().parse(decodeURIComponent(toCheck.link))
      return true
    } catch {
      return false
    }
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: decodeURIComponent(toTransform.redirectTo),
        link: decodeURIComponent(toTransform.link),
      }
    }
    return {
      ...toTransform,
      link: decodeURIComponent(toTransform.link),
    }
  })

export const encodeTransferRequestAda = TransferRequestAdaSchema.refine(
  (toCheck) => {
    if (toCheck.redirectTo != null && isUnsafeUrl(toCheck.redirectTo))
      return false

    return true
  },
).transform((toTransform) => {
  if (toTransform.redirectTo != null) {
    return {
      ...toTransform,
      redirectTo: encodeURIComponent(toTransform.redirectTo),
    }
  }
  return toTransform
})

export const decodeTransferRequestAda = TransferRequestAdaSchema.refine(
  (toCheck) => {
    if (
      toCheck.redirectTo != null &&
      isUnsafeUrl(decodeURIComponent(toCheck.redirectTo))
    )
      return false

    return true
  },
).transform((toTransform) => {
  if (toTransform.redirectTo != null) {
    return {
      ...toTransform,
      redirectTo: decodeURIComponent(toTransform.redirectTo),
    }
  }
  return toTransform
})
