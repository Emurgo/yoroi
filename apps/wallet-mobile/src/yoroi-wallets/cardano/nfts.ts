import {Portfolio} from '@yoroi/types'
import {createTypeGuardFromSchema, isArrayOfType, isString} from '@yoroi/wallets'
import {z} from 'zod'

const normalizeProperty = (value: string | string[]): string => {
  if (isArrayOfType(value, isString)) return value.join('')
  return value
}

export const isSvgMediaType = (mediaType: unknown): boolean => {
  return mediaType === 'image/svg+xml'
}

export const getNftFilenameMediaType = (filename: string, files: Portfolio.Token['files'] = []): string | undefined => {
  const file = files.find((file) => file.src && normalizeProperty(file.src) === filename)
  return file?.mediaType
}

type NftMetadataFilesProperty = {
  files?: Array<{src?: string | string[]; mediaType?: string}>
}

const StringOrArrayOfStringsSchema: z.ZodSchema<string | string[]> = z.union([z.string(), z.array(z.string())])

export const hasNameProperty = createTypeGuardFromSchema<{name: string | string[]}>(
  z.object({name: StringOrArrayOfStringsSchema}),
)

export const hasDescriptionProperty = createTypeGuardFromSchema<{description: string | string[]}>(
  z.object({description: StringOrArrayOfStringsSchema}),
)

export const hasMediaTypeProperty = createTypeGuardFromSchema<{mediaType: string | string[]}>(
  z.object({mediaType: StringOrArrayOfStringsSchema}),
)

export const hasImageProperty = createTypeGuardFromSchema<{image: string | string[]}>(
  z.object({image: StringOrArrayOfStringsSchema}),
)

const NftMetadataFilesSchema: z.ZodSchema<NftMetadataFilesProperty> = z.object({
  files: z.array(z.object({src: StringOrArrayOfStringsSchema.optional(), mediaType: z.string().optional()})).optional(),
})

export const hasFilesProperty = createTypeGuardFromSchema(NftMetadataFilesSchema)
