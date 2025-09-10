import {ZodSchema} from 'zod'

export type SchemaInfer<T> = T extends ZodSchema<infer U> ? U : never
