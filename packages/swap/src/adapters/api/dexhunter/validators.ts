import {Dex} from './types'

export function isDex(value: any): value is Dex {
  return Object.values(Dex).includes(value)
}
