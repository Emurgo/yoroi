import {Dex} from './types'

export function isDex(value: unknown): value is Dex {
  return Object.values(Dex).includes(value)
}
