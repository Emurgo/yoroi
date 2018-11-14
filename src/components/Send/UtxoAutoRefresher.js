import React from 'react'
import {NavigationEvents} from 'react-navigation'
import {BigNumber} from 'bignumber.js'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {
  amountPendingSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'

class _UtxoAutoRefresher extends React.Component<{
  isFetching: boolean,
  isOnline: boolean,
  fetchUTXOs: () => any,
  pendingAmount: ?BigNumber,
}> {
  componentDidMount = () => {
    this.refetch()
  }

  componentDidUpdate = (prevProps) => {
    const wentOnline = this.props.isOnline && !prevProps.isOnline
    const wentFromPending =
      this.props.pendingAmount == null && prevProps.pendingAmount != null

    if (wentOnline || wentFromPending) {
      this.refetch()
    }
  }

  refetch = () => {
    if (!this.props.isFetching) this.props.fetchUTXOs()
  }

  handleDidFocus = () => {
    this.refetch()
  }

  render = () => <NavigationEvents onDidFocus={this.handleDidFocus} />
}

export default compose(
  connect(
    (state) => ({
      isFetching: isFetchingUtxosSelector(state),
      isOnline: isOnlineSelector(state),
      pendingAmount: amountPendingSelector(state),
    }),
    {
      fetchUTXOs,
    },
  ),
)(_UtxoAutoRefresher)
