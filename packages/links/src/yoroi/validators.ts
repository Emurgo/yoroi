import z from 'zod'

import {linksCardanoModuleMaker} from '../cardano/module'

const PartnerInfoSchema = z.object({
  isProduction: z.boolean().optional(),
  appId: z.string().max(40).optional(),
  redirectTo: z.string().url().max(2048).optional(),
  message: z.string().max(256).optional(),
  walletName: z.string().max(40).optional(),
  authorization: z.string().max(256).optional(),
  signature: z.string().max(256).optional(),
})

export const LinksYoroiExchangeShowCreateResultSchema = z
  .object({
    provider: z.string().max(20),
    coinAmount: z.number().nonnegative(),
    coin: z.string().max(20),
    fiatAmount: z.number().nonnegative(),
    fiat: z.string().max(20),
    status: z.string().max(20),
  })
  .merge(PartnerInfoSchema)
  .strict()

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

export const LinksYoroiTransferRequestAdaWithLinkSchema = z
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
