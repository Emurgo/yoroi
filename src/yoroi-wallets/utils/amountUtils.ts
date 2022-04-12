import {compose} from 'lodash/fp'

import {insertAt} from '../../legacy/string'

export const stripExcessiveDecimals = (number: string) => {
  const separatorIndex = number.indexOf('.')

  return separatorIndex === -1 ? number : number.substring(0, separatorIndex + 1 + 6)
}

export const stripAllButLastDecimalSeparators = (number: string) => {
  const lastSeparatorIndex = number.lastIndexOf('.')
  if (lastSeparatorIndex !== -1) {
    const separatorCount = number.split('').filter((x) => x === '.').length

    number = number.replace(/\./g, '')
    number = insertAt(number, lastSeparatorIndex - separatorCount + 1, '.')
  }

  return number
}

export const stripAllButFirstDecimalSeparator = (number: string) => {
  const separatorIndex = number.indexOf('.')

  if (separatorIndex !== -1) {
    number = number.replace(/\./g, '')
    number = insertAt(number, separatorIndex, '.')
  }

  return number
}

export const stripCommas = (number: string) => number.replace(/,/g, '')

export const stripInvalidCharacters = (number: string) => number.replace(/[^0-9.,]/g, '')

export const formatSeparatorWithoutDigits = (number: string) => (number === '.' ? '0.' : number)

export const formatMultiLangSeparator = (number: string) => number.replace(/,/g, '.')

export const pastedFormatter = compose(
  formatSeparatorWithoutDigits,
  stripExcessiveDecimals,
  stripAllButLastDecimalSeparators,
  stripCommas,
  stripInvalidCharacters,
)

export const editedFormatter = compose(
  formatSeparatorWithoutDigits,
  stripExcessiveDecimals,
  stripAllButFirstDecimalSeparator,
  formatMultiLangSeparator,
  stripInvalidCharacters,
)
