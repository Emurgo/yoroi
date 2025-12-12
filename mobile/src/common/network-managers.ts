import {CardanoApi} from '@yoroi/api'
import {buildNetworkManagers} from '@yoroi/blockchains'

import {tokenManagers} from '~/features/Portfolio/common/constants'

/**
 * Create network managers for the wallet manager
 * This is app-specific and should be created here, not in the package
 */
export const networkManagers = buildNetworkManagers({
  tokenManagers,
  apiMaker: CardanoApi.cardanoApiMaker,
})
