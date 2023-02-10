import {isEmpty} from 'lodash'

export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}
