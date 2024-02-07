import {ZodError} from 'zod'

export function handleZodErrors(error: any) {
  if (error instanceof ZodError) {
    const errorDetails = error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    const errorMessage = `Invalid data: ${errorDetails
      .map((e) => `${e.field}: ${e.message}`)
      .join(', ')}`
    return errorMessage
  }
  return null
}
