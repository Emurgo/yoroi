import {isEmpty} from 'lodash'

/**
 * Wrapper function to lodash.isEmpty that
 * returns true if the string is empty.
 * The lodash.isEmpty function doesn't have the typescript's safeguard signature.
 * It will be fixed in this PR https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60401
 *
 * @summary Returns true if the value is empty: length === 0, null or undefined, else false.
 *
 * @param value The string to inspect
 * @return {boolean} Returns true if the string is empty, else false.
 *
 * @example isEmptyString('') returns true
 * @example isEmptyString(' ') returns false
 * @example isEmptyString(null) returns true
 * @example isEmptyString(undefined) returns true
 */
export function isEmptyString(value: string | null | undefined): value is '' | null | undefined {
  return isEmpty(value)
}
