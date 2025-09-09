import {BigNumber} from 'bignumber.js'
import * as React from 'react'

import {useLanguage} from './LanguageProvider'

export const useFormatNumber = () => {
  const {numberLocale} = useLanguage()
  return React.useCallback(
    (value: number) => new BigNumber(value, 10).toFormat(numberLocale),
    [numberLocale],
  )
}
