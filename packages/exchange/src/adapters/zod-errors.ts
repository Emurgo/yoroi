import {Exchange} from '@yoroi/types'
import {ZodError} from 'zod'

/**
 * Converts a ZodError or Error to a BanxaError.
 * @param error - The error to convert.
 * @throws An appropriate BanxaError based on zod error, or ignore it.
 */
export function handleZodErrors(error: ZodError | any) {
  if (error instanceof ZodError) {
    const errorDetails = error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    const errorMessage = `Invalid data: ${errorDetails
      .map((e) => `${e.field}: ${e.message}`)
      .join(', ')}`
    throw new Exchange.Errors.Validation(errorMessage)
  }
  throw new Exchange.Errors.Unknown(JSON.stringify(error))
}
