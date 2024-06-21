import {logger} from '../logger'

export function throwLoggedError(error: Error | string): never {
  const errorToThrow = error instanceof Error ? error : new Error(error)
  logger.error(errorToThrow)
  throw errorToThrow
}
