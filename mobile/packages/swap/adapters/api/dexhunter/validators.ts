import {Dex} from './types'

export function isDex(value: unknown): value is Dex {
  return typeof value === 'string' && Object.values(Dex).includes(value as Dex)
}
