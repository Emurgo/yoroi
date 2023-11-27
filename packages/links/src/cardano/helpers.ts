import {isString} from '@yoroi/common'

// TODO: validate address with headless
export const isCardanoAddress = (address: string) =>
  isString(address) && /^[A-Za-z_0-9]+$/.test(address)
