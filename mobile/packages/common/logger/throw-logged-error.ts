import {App} from '@yoroi/types'

export const throwLoggedError =
  (logger: App.Logger.Manager) =>
  (error: Error | string): never => {
    const errorToThrow = error instanceof Error ? error : new Error(error)
    logger.error(errorToThrow)
    throw errorToThrow
  }
