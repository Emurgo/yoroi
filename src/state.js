import HistoryTransaction from './types/HistoryTransaction'

import historyData from './mockData/history.json'
import receiveAddresses from './mockData/addresses.json'
import {processTxHistoryData} from './helpers/utils'

export type InitialState = {
  languageCode: string,
  transactions: Array<HistoryTransaction>,
  ownAddresses: Array<string>,
}

export const getInitialState = (): InitialState => ({
  languageCode: 'en-US',
  receiveAddresses,
  transactions: historyData.map((data) => processTxHistoryData(data, receiveAddresses)),
})

export default getInitialState
