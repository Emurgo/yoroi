// @flow
import React from 'react'
import {useNavigation} from '@react-navigation/native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import type {ComponentType} from 'react'

import {
  hasPendingOutgoingTransactionSelector,
  isFetchingUtxosSelector,
  isOnlineSelector,
} from '../../selectors'
import {fetchUTXOs} from '../../actions/utxo'

class UtxoAutoRefresher extends React.Component<{
  isFetching: boolean,
  isOnline: boolean,
  fetchUTXOs: () => any,
  hasPendingTx: boolean,
}> {
  _firstFocus: boolean = true
  _unsubscribe: void | () => mixed = undefined

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () =>
      this.handleDidFocus()
    )
    this.refetch()
  }

  componentDidUpdate = (prevProps) => {
    const wentOnline = !prevProps.isOnline && this.props.isOnline
    const wentFromPending = prevProps.hasPendingTx && !this.props.hasPendingTx

    if (wentOnline || wentFromPending) {
      // Todo(ppershing): there is a race condition when we do not refetch
      // because fetching is already in progress for some reason
      this.refetch()
    }
  }

  componentWillUnmount = () => {
    if (this._unsubscribe != null) this._unsubscribe()
  }

  refetch = () => {
    if (!this.props.isFetching) this.props.fetchUTXOs()
  }

  handleDidFocus = () => {
    if (this._firstFocus) {
      this._firstFocus = false
      // skip first focus to avoid
      // didMount -> refetch -> done -> didFocus -> refetch
      // blinking
      return
    }
    this.refetch()
  }

  render = () => null
}

export default (compose(
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
)((props) => {
  const navigation = useNavigation()
  return <UtxoAutoRefresher {...props} navigation={navigation} />
}): ComponentType<{}>)
