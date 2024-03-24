import {ZodSchema} from 'zod'

import {
  ExchangeShowCreateResultSchema,
  TransferRequestAdaSchema,
  TransferRequestAdaWithLinkSchema,
} from './validators'

export type SchemaInfer<T> = T extends ZodSchema<infer U> ? U : never

export type LinksExchangeShowCreateResultParams = SchemaInfer<
  typeof ExchangeShowCreateResultSchema
>
export type LinksTransferRequestAdaParams = SchemaInfer<
  typeof TransferRequestAdaSchema
>
export type LinksTransferRequestAdaWithLinkParams = SchemaInfer<
  typeof TransferRequestAdaWithLinkSchema
>

export type LinksYoroiActionInfo =
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada-with-link'
      params: LinksTransferRequestAdaWithLinkParams
    }
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada'
      params: LinksTransferRequestAdaParams
    }
  | {
      version: 1
      feature: 'exchange'
      useCase: 'order/show-create-result'
      params: LinksExchangeShowCreateResultParams
    }

export type LinksYoroiAction = {
  info: LinksYoroiActionInfo
  isTrusted: boolean
}
