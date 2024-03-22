import {linksCardanoModuleMaker} from '../cardano/module'
import {
  ExchangeShowCreateResultSchema,
  TransferRequestAdaSchema,
  TransferRequestAdaWithLinkSchema,
  isSafeUrl,
} from './validators'

export const encodeExchangeShowCreateResult =
  ExchangeShowCreateResultSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null && !isSafeUrl(toCheck.redirectTo))
      return false

    return true
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: Buffer.from(toTransform.redirectTo).toString('hex'),
      }
    }
    return toTransform
  })
export const decodeExchangeShowCreateResult =
  ExchangeShowCreateResultSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null) {
      const decodedRedirectTo = Buffer.from(
        toCheck.redirectTo,
        'hex',
      ).toString()

      if (!isSafeUrl(decodedRedirectTo)) return false
    }
    return true
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: Buffer.from(toTransform.redirectTo, 'hex').toString(),
      }
    }
    return toTransform
  })

export const encodeTransferRequestAdaWithLink =
  TransferRequestAdaWithLinkSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null && !isSafeUrl(toCheck.redirectTo))
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
        redirectTo: Buffer.from(toTransform.redirectTo).toString('hex'),
        link: Buffer.from(toTransform.link).toString('hex'),
      }
    }
    return {
      ...toTransform,
      link: Buffer.from(toTransform.link).toString('hex'),
    }
  })

export const decodeTransferRequestAdaWithLink =
  TransferRequestAdaWithLinkSchema.refine((toCheck) => {
    if (toCheck.redirectTo != null) {
      const decodedRedirectTo = Buffer.from(
        toCheck.redirectTo,
        'hex',
      ).toString()
      if (!isSafeUrl(decodedRedirectTo)) return false
    }
    try {
      linksCardanoModuleMaker().parse(
        Buffer.from(toCheck.link, 'hex').toString(),
      )
      return true
    } catch {
      return false
    }
  }).transform((toTransform) => {
    if (toTransform.redirectTo != null) {
      return {
        ...toTransform,
        redirectTo: Buffer.from(toTransform.redirectTo, 'hex').toString(),
        link: Buffer.from(toTransform.link, 'hex').toString(),
      }
    }
    return {
      ...toTransform,
      link: Buffer.from(toTransform.link, 'hex').toString(),
    }
  })

export const encodeTransferRequestAda = TransferRequestAdaSchema.refine(
  (toCheck) => {
    if (toCheck.redirectTo != null && !isSafeUrl(toCheck.redirectTo))
      return false

    return true
  },
).transform((toTransform) => {
  if (toTransform.redirectTo != null) {
    return {
      ...toTransform,
      redirectTo: Buffer.from(toTransform.redirectTo).toString('hex'),
    }
  }
  return toTransform
})

export const decodeTransferRequestAda = TransferRequestAdaSchema.refine(
  (toCheck) => {
    if (toCheck.redirectTo != null) {
      const decodedRedirectTo = Buffer.from(
        toCheck.redirectTo,
        'hex',
      ).toString()
      if (!isSafeUrl(decodedRedirectTo)) return false
    }
    return true
  },
).transform((toTransform) => {
  if (toTransform.redirectTo != null) {
    return {
      ...toTransform,
      redirectTo: Buffer.from(toTransform.redirectTo, 'hex').toString(),
    }
  }
  return toTransform
})
