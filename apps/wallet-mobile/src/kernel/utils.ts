import {isEmpty} from 'lodash'

export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}

export const makeList = (length = 0) => Array.from({length}).fill(1)
