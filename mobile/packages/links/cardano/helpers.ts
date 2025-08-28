import {isString} from '@yoroi/common'

// TODO: validate address with headless
// NOTE: simple test for now
export const isCardanoAddress = (address: string) =>
  isString(address) && /^[A-Za-z_0-9]+$/.test(address)
