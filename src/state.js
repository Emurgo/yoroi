// @flow
import HistoryTransaction from './types/HistoryTransaction'

import historyData from './mockData/history.json'
import receiveAddresses from './mockData/addresses.json'
import {processTxHistoryData} from './helpers/utils'
import l10n from './l10n'
import type {LocaleData} from './l10n/type'

export type State = {
  languageCode: string,
  transactions: Array<typeof HistoryTransaction>,
  receiveAddresses: Array<string>,
  l10n: LocaleData,
}

export const getInitialState = (): State => ({
  languageCode: 'en-US',
  receiveAddresses,
  transactions: historyData.map((data) => processTxHistoryData(data, receiveAddresses)),
  l10n,
})

export default getInitialState
