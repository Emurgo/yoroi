/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'
import {defineMessages} from 'react-intl'

const messages = defineMessages({})

// Base class to allow wrapping a localizable message into an ES6-error
class LocalizableError extends ExtendableError {
  id: string
  defaultMessage: string
  values: Record<string, unknown>

  constructor({id, defaultMessage, values = {}}: {id: string, defaultMessage: string, values?: Record<string, unknown>}) {
    if (!id) throw new Error('id:string is required.')
    if (!defaultMessage) throw new Error('defaultMessage:string is required.')
    super(`${id}: ${JSON.stringify(values)}`)
    this.id = id
    this.defaultMessage = defaultMessage
    this.values = values ?? {}
  }
}

// We are only supposed to throw LocalizableError
// We use this as a fallback in case of programmer error
class UnknowError extends LocalizableError {
  constructor() {
    super({
      id: (messages as any).unknowError.id,
      defaultMessage: (messages as any).unknowError.defaultMessage,
    })
  }
}

export class UnexpectedError extends LocalizableError {
  constructor() {
    super({
      id: (messages as any).unexpectedError.id,
      defaultMessage: (messages as any).unexpectedError.defaultMessage,
    })
  }
}

export function localizedError(error: any): LocalizableError {
  if (error instanceof LocalizableError) {
    return error
  }
  return new UnknowError()
}

export default LocalizableError
