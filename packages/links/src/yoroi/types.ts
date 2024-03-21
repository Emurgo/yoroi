import {ZodSchema} from 'zod'

import {
  LinksYoroiExchangeShowCreateResultSchema,
  LinksYoroiTransferRequestAdaSchema,
  LinksYoroiTransferRequestAdaWithLinkSchema,
} from './validators'

export type SchemaInfer<T> = T extends ZodSchema<infer U> ? U : never

export type LinksYoroiExchangeShowCreateResultParams = SchemaInfer<
  typeof LinksYoroiExchangeShowCreateResultSchema
>
export type LinksYoroiTransferRequestAdaParams = SchemaInfer<
  typeof LinksYoroiTransferRequestAdaSchema
>
export type LinksYoroiTransferRequestAdaWithLinkParams = SchemaInfer<
  typeof LinksYoroiTransferRequestAdaWithLinkSchema
>
