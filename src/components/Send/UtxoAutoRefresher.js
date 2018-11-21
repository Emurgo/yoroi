import React from 'react'
import {NavigationEvents} from 'react-navigation'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'

class _UtxoAutoRefresher extends React.Component<{
  isFetching: boolean,
  isOnline: boolean,
  fetchUTXOs: () => any,
  hasPendingTx: boolean,
}> {
  _firstFocus = true

  componentDidMount = () => {
    this.refetch()
  }

  componentDidUpdate = (prevProps) => {
    const wentOnline = this.props.isOnline && !prevProps.isOnline
    const wentFromPending = prevProps.hasPendingTx && !this.props.hasPendingTx

    if (wentOnline || wentFromPending) {
      // Todo(ppershing): there is a race condition when we do not refetch
      // because fetching is already in progress for some reason
      this.refetch()
    }
  }

  refetch = () => {
    if (!this.props.isFetching) this.props.fetchUTXOs()
  }

  handleDidFocus = () => {
    if (this._firstFocus) {
      this._firstFocus = true
      // skip first focus to avoid
      // didMount -> refetch -> done -> didFocus -> refetch
      // blinking
      return
    }
    this.refetch()
  }

  render = () => <NavigationEvents onDidFocus={this.handleDidFocus} />
}

export default compose(
  connect(
    (state) => ({
      isFetching: isFetchingUtxosSelector(state),
      isOnline: isOnlineSelector(state),
      hasPendingTx: hasPendingOutgoingTransactionSelector(state),
    }),
    {
      fetchUTXOs,
    },
  ),
)(_UtxoAutoRefresher)
