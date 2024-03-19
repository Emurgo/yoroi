import {Links} from '@yoroi/types'
import {z, ZodTypeAny} from 'zod'

import {linksCardanoModuleMaker} from '../cardano/module'
import {SchemaInfer} from './types'

export const linksYoroiBuilder = <T extends ZodTypeAny>(
  schema: T,
  config: Links.YoroiUriConfig,
) => {
  const create = (params: Readonly<SchemaInfer<T>>) => {
    const result = schema.safeParse(params)

    if (!result.success) {
      throw new Links.Errors.ParamsValidationFailed(
        `Validation failed: ${result.error}`,
      )
    }

    const queryParams = new URLSearchParams()

    const appendParam = (key: string, value: unknown) => {
      if (Array.isArray(value)) {
        value.forEach((item) => appendParam(key, item))
      } else if (typeof value === 'object') {
        queryParams.append(key, JSON.stringify(value))
      } else {
        queryParams.append(key, String(value))
      }
    }

    Object.entries(result.data).forEach(([key, value]) => {
      appendParam(key, value)
    })

    const {scheme, authority, path, version} = config
    const url = new URL(
      `${scheme}://${authority}/${version}/${path}?${queryParams.toString()}`,
    )
    return url.toString()
  }

  return {create}
}

export const LinksYoroiExchangeShowCreateResulSchema = z
  .object({
    provider: z.string().max(20),
    coinAmount: z.number().nonnegative(),
    coin: z.string().max(20),
    fiatAmount: z.number().nonnegative(),
    fiat: z.string().max(20),
    status: z.string().max(20),
    walletName: z.string().max(40).optional(),
    isProduction: z.boolean().optional(),
    link: z.string().url().optional(),
  })
  .strict()

const PartnerInfoSchema = z.object({
  business: z.literal('exchange').optional(),
  partnerId: z.string().max(20).optional(),
  redirectTo: z.string().url().max(2048).optional(),
  message: z.string().max(256).optional(),
})

export const LinksYoroiTransferRequestAdaSchema = z
  .object({
    targets: z
      .array(
        z.object({
          receiver: z.string().max(256),
          datum: z.string().max(1024).optional(),
          amounts: z
            .array(
              z.object({
                tokenId: z.string().max(256),
                quantity: z.string().max(80),
              }),
            )
            .max(10)
            .min(1),
        }),
      )
      .max(5)
      .min(1),
    memo: z.string().max(256).optional(),
  })
  .merge(PartnerInfoSchema)
  .strict()

export const LinksYoroiTransferRequestAdaWithUrlSchema = z
  .object({
    link: z.string().url().max(2048),
  })
  .merge(PartnerInfoSchema)
  .strict()
  .refine((check) => {
    try {
      linksCardanoModuleMaker().parse(check.link)
      return true
    } catch {
      return false
    }
  })
