import {throwLoggedError as tle} from '@yoroi/logger'

import {logger} from '~/kernel/logger/logger'

// NOTE: wrapped cuz `never` is not working properly in typescript when importing
export const throwLoggedError: (error: string | Error) => never = tle(logger)
