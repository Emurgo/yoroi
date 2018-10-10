import _ from 'lodash'
import moment from 'moment'

import api from './api'
import ownAddresses from './mockData/addresses.json'


const _updateTransactions = (rawTransactions) => ({
  type: 'Update transactions',
  path: ['rawTransactions'],
  payload: rawTransactions,
  reducer: (state, payload) => payload,
})

export const updateHistory = () => (dispatch) => {
  const ts = moment.utc('2018-01-01T09:44:39.757Z').unix()
  api.fetchNewTxHistory(ts, ownAddresses)
    .then((response) => {
      dispatch(_updateTransactions(_.keyBy(response, (tx) => tx.hash)))
    })
}
