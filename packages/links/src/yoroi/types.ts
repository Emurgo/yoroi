import {ZodSchema} from 'zod'
import {
  LinksYoroiExchangeShowCreateResulSchema,
  LinksYoroiTransferRequestAdaSchema,
  LinksYoroiTransferRequestAdaWithUrlSchema,
} from './links-builder'

export type SchemaInfer<T> = T extends ZodSchema<infer U> ? U : never

export type LinksYoroiExchangeShowCreateResultParams = SchemaInfer<
  typeof LinksYoroiExchangeShowCreateResulSchema
>
export type LinksYoroiTransferRequestAdaParams = SchemaInfer<
  typeof LinksYoroiTransferRequestAdaSchema
>
export type LinksYoroiTransferRequestAdaWithUrlParams = SchemaInfer<
  typeof LinksYoroiTransferRequestAdaWithUrlSchema
>
