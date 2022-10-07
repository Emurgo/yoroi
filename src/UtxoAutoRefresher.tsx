/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNetInfo} from '@react-native-community/netinfo'
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {useHasPendingTx} from './hooks'
import {isFetchingUtxosSelector} from './legacy/selectors'
import {fetchUTXOs} from './legacy/utxo'
import {useSelectedWallet} from './SelectedWallet'

type Props = {
  isFetching: boolean
  isOnline: boolean
  fetchUTXOs: () => void
  hasPendingTx: boolean
  navigation: any
}
// eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
class UtxoAutoRefresherClass extends React.Component<Props> {
  _firstFocus = true
  _unsubscribe: void | (() => unknown) = undefined

  componentDidMount = () => {
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.handleDidFocus())
    this.refetch()
  }

  componentDidUpdate = (prevProps: Props) => {
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
  const netInfo = useNetInfo()
  const wallet = useSelectedWallet()
  const hasPendingTx = useHasPendingTx(wallet)
  const dispatch = useDispatch()

  return (
    <UtxoAutoRefresherClass
      isFetching={isFetching}
      isOnline={netInfo.type !== 'none' && netInfo.type !== 'unknown'}
      hasPendingTx={hasPendingTx}
      navigation={navigation}
      fetchUTXOs={() => dispatch(fetchUTXOs())}
    />
  )
}
