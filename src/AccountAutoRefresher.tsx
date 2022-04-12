/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {fetchAccountState} from './legacy/account'
import {
  hasPendingOutgoingTransactionSelector,
  isFetchingAccountStateSelector,
  isOnlineSelector,
  utxosSelector,
} from './legacy/selectors'
import type {RawUtxo} from './legacy/types'

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class AccountAutoRefresherClass extends React.Component<{
  isFetching: boolean
  isOnline: boolean
  fetchAccountState: () => void
  hasPendingTx: boolean
  utxo: undefined | null | Array<RawUtxo>
  navigation: any
}> {
  _firstFocus = true
  _unsubscribe: void | (() => unknown) = undefined

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

export const AccountAutoRefresher = () => {
  const navigation = useNavigation()
  const isFetching = useSelector(isFetchingAccountStateSelector)
  const isOnline = useSelector(isOnlineSelector)
  const hasPendingTx = useSelector(hasPendingOutgoingTransactionSelector)
  const utxo = useSelector(utxosSelector)
  const dispatch = useDispatch()

  return (
    <AccountAutoRefresherClass
      isFetching={isFetching}
      isOnline={isOnline}
      hasPendingTx={hasPendingTx}
      utxo={utxo}
      navigation={navigation}
      fetchAccountState={() => dispatch(fetchAccountState())}
    />
  )
}
