/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {hasPendingOutgoingTransactionSelector, isFetchingUtxosSelector, isOnlineSelector} from './legacy/selectors'
import {fetchUTXOs} from './legacy/utxo'

// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class UtxoAutoRefresherClass extends React.Component<{
  isFetching: boolean
  isOnline: boolean
  fetchUTXOs: () => void
  hasPendingTx: boolean
  navigation: any
}> {
  _firstFocus = true
  _unsubscribe: void | (() => unknown) = undefined

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.handleDidFocus())
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

export const UtxoAutoRefresher = () => {
  const navigation = useNavigation()
  const isFetching = useSelector(isFetchingUtxosSelector)
  const isOnline = useSelector(isOnlineSelector)
  const hasPendingTx = useSelector(hasPendingOutgoingTransactionSelector)
  const dispatch = useDispatch()

  return (
    <UtxoAutoRefresherClass
      isFetching={isFetching}
      isOnline={isOnline}
      hasPendingTx={hasPendingTx}
      navigation={navigation}
      fetchUTXOs={() => dispatch(fetchUTXOs())}
    />
  )
}
