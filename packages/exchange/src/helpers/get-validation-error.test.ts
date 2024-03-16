import {Exchange} from '@yoroi/types'
import {z} from 'zod'

import {getValidationError} from './get-validation-error'

describe('getValidationError', () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  })

  test('should convert a ZodError into a ValidationError', () => {
    const invalidData = {
      name: 123,
      age: 'John Doe',
    }

    try {
      testSchema.parse(invalidData)
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError)

      // Handle the error
      let handledError
      try {
        throw getValidationError(error)
      } catch (e: any) {
        handledError = e

        expect(handledError).toBeInstanceOf(Exchange.Errors.Validation)
        expect(handledError?.message).toBe(
          'Invalid data: name: Expected string, received number, age: Expected number, received string',
        )
      }
    }
  })

  test('should re-throw an error that is not a ZodError', () => {
    const someOtherError = new Error('Some other error')

    let handledError
    try {
      throw getValidationError(someOtherError)
    } catch (e) {
      handledError = e
    }

    expect(handledError).toBeInstanceOf(Exchange.Errors.Unknown)
  })
})
