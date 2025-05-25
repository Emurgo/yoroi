import {throwLoggedError as tle} from '@yoroi/common'

import {logger} from '../logger'

// NOTE: wrapped cuz `never` is not working properly in typescript when importing
export const throwLoggedError: (error: string | Error) => never = tle(logger)
