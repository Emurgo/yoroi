import HistoryTransaction from './types/HistoryTransaction'

import historyData from './mockData/history.json'
import ownAddresses from './mockData/addresses.json'
import {processTxHistoryData} from './helpers/utils'

export type InitialState = {
  dummy: string,
  transactions: Array<HistoryTransaction>,
  ownAddresses: Array<string>,
}

export const getInitialState = (): InitialState => ({
  dummy: 'This is some dummy state',
  ownAddresses,
  transactions: historyData.map((data) => processTxHistoryData(data, ownAddresses)),
})

export default getInitialState
