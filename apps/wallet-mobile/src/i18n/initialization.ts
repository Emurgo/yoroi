import BigNumber from 'bignumber.js'
import {findBestLanguageTag, getNumberFormatSettings} from 'react-native-localize'

import {decimalComma, decimalDot, supportedLanguagesCodes} from './languages'

export const systemLocale = findBestLanguageTag(supportedLanguagesCodes)?.languageTag ?? 'en-US'
export const numberLocale = getNumberFormatSettings().decimalSeparator === '.' ? decimalDot : decimalComma

BigNumber.config({
  FORMAT: numberLocale,
})
