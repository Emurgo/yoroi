import z from 'zod'

export const PartnerInfoSchema = z.object({
  isSandbox: z.boolean().optional(),
  isTestnet: z.boolean().optional(),
  appId: z.string().max(40).optional(),
  message: z.string().max(256).optional(),
  walletId: z.string().max(40).optional(),
  authorization: z.string().max(256).optional(),
  signature: z.string().max(256).optional(),
  redirectTo: z.string().max(2048).optional(),
})

export const ExchangeShowCreateResultSchema = z
  .object({
    provider: z.string().max(20),
    coinAmount: z.number().nonnegative().optional(),
    coin: z.string().max(20).optional(),
    fiatAmount: z.number().nonnegative().optional(),
    fiat: z.string().max(20).optional(),
    status: z
      .union([z.literal('success'), z.literal('pending'), z.literal('failed')])
      .optional(),
    orderType: z.union([z.literal('buy'), z.literal('sell')]),
  })
  .merge(PartnerInfoSchema)
  .strict()

export const TransferRequestAdaSchema = z
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

export const TransferRequestAdaWithLinkSchema = z
  .object({
    link: z.string().max(2048),
  })
  .merge(PartnerInfoSchema)
  .strict()

export const BrowserLaunchDappUrlSchema = z
  .object({
    dappUrl: z.string().max(2048),
  })
  .merge(PartnerInfoSchema)
  .strict()

export const isUnsafeUrl = (url: string) => url.startsWith('http:')
