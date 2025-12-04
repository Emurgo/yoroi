import type {AddressAllocation} from '../types'

export type AirdropRoutes = {
  'airdrop-address': undefined
  'airdrop-main': {allocation: AddressAllocation}
  'airdrop-thaw-schedule': {allocation: AddressAllocation}
}

