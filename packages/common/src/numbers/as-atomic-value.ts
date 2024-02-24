import {Numbers} from '@yoroi/types'

export const asAtomicValue = (value: bigint | number | string | boolean) => {
  try {
    return BigInt(value).toString(10) as Numbers.AtomicValue
  } catch (_) {
    throw new Numbers.Errors.InvalidAtomicValue()
  }
}
