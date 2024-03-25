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

export type LinksYoroiActionInfo =
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada-with-link'
      params: LinksYoroiTransferRequestAdaWithLinkParams
    }
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada'
      params: LinksYoroiTransferRequestAdaParams
    }
  | {
      version: 1
      feature: 'exchange'
      useCase: 'order/show-create-result'
      params: LinksYoroiExchangeShowCreateResultParams
    }

export type LinksYoroiAction = {
  info: LinksYoroiActionInfo
  isTrusted: boolean
}
