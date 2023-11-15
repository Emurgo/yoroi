import {handleZodErrors} from './zod-errors'
import {BanxaUnknownError, BanxaValidationError} from './errors'
import {z} from 'zod'

describe('handleZodErrors', () => {
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
        handleZodErrors(error)
      } catch (e: any) {
        handledError = e

        expect(handledError).toBeInstanceOf(BanxaValidationError)
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
      handleZodErrors(someOtherError)
    } catch (e) {
      handledError = e
    }

    expect(handledError).toBeInstanceOf(BanxaUnknownError)
  })
})
