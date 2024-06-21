import {parseSafe} from '@yoroi/common'
import {Wallet} from '@yoroi/types'

import {addressModes} from '../constants'

export const isAddressMode = (data: unknown): data is Wallet.AddressMode => addressModes.includes(data as never)

export const parseAddressMode = (data: unknown) => {
  const parsed = parseSafe(data)

  return isAddressMode(parsed) ? parsed : undefined
}
