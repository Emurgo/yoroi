// @flow

import React from 'react'
import {useNavigation} from '@react-navigation/native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import type {ComponentType} from 'react'

import {
  hasPendingOutgoingTransactionSelector,
  isFetchingAccountStateSelector,
  isOnlineSelector,
  utxosSelector,
} from '../../selectors'
import {fetchAccountState} from '../../actions/account'

import type {RawUtxo} from '../../api/types'

class AccountAutoRefresher extends React.Component<{
  isFetching: boolean,
  isOnline: boolean,
  fetchAccountState: () => any,
  hasPendingTx: boolean,
  utxo: ?Array<RawUtxo>,
  navigation: any,
}> {
  _firstFocus = true
  _unsubscribe: void | (() => mixed) = undefined

  componentDidMount = async () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.handleDidFocus())
    await this.refetch()
  }

  // TODO: this ideally should only track the state of a delegation tx
  componentDidUpdate = (prevProps) => {
    const wentOnline = !prevProps.isOnline && this.props.isOnline
    const wentFromPending = prevProps.hasPendingTx && !this.props.hasPendingTx
    const gotUtxo = prevProps.utxo !== this.props.utxo

    if (wentOnline || wentFromPending || gotUtxo) {
      // Todo(ppershing): there is a race condition when we do not refetch
      // because fetching is already in progress for some reason
      this.refetch()
    }
  }

  componentWillUnmount = () => {
    if (this._unsubscribe != null) this._unsubscribe()
  }

  refetch = () => {
    if (!this.props.isFetching) this.props.fetchAccountState()
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
      isFetching: isFetchingAccountStateSelector(state),
      isOnline: isOnlineSelector(state),
      hasPendingTx: hasPendingOutgoingTransactionSelector(state),
      utxo: utxosSelector(state),
    }),
    {
      fetchAccountState,
    },
  ),
)((props) => {
  const navigation = useNavigation()
  return <AccountAutoRefresher {...props} navigation={navigation} />
}): ComponentType<{}>)
