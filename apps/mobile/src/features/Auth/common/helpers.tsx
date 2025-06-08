import * as AuthHost from 'expo-local-authentication'
import {freeze} from 'immer'

import {logger} from '../../../kernel/logger/logger'
import {AuthHostConfig} from './types'

export const getAuthHostConfig = async (): Promise<
  Readonly<AuthHostConfig>
> => {
  try {
    const [hasHardware, isEnrolled, methods] = await Promise.all([
      AuthHost.hasHardwareAsync(),
      AuthHost.isEnrolledAsync(),
      AuthHost.supportedAuthenticationTypesAsync(),
    ])

    return freeze(
      {
        isSupported: hasHardware,
        isEnrolled,
        canAuthWithHost: hasHardware && isEnrolled,
        methods,
      },
      true,
    )
  } catch (error) {
    logger.error(error as Error, {origin: 'getAuthHostConfig', type: 'error'})
    return freeze(
      {
        isSupported: false,
        isEnrolled: false,
        canAuthWithHost: false,
        methods: [],
      },
      true,
    )
  }
}
