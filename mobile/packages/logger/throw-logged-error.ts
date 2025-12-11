import {LoggerManager} from './types'

export const throwLoggedError =
  (logger: LoggerManager) =>
  (error: Error | string): never => {
    const errorToThrow = error instanceof Error ? error : new Error(error)
    logger.error(errorToThrow)
    throw errorToThrow
  }
