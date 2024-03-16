import {Exchange} from '@yoroi/types'
import {ZodError} from 'zod'

export function getValidationError(error: unknown) {
  if (error instanceof ZodError) {
    const errorDetails = error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    const errorMessage = `Invalid data: ${errorDetails
      .map((e) => `${e.field}: ${e.message}`)
      .join(', ')}`
    return new Exchange.Errors.Validation(errorMessage)
  }
  return new Exchange.Errors.Unknown(JSON.stringify(error))
}
