import {throwLoggedError as tle} from '@yoroi/common'

import {logger} from '../logger'

export const throwLoggedError: (error: string | Error) => never = tle(logger)
