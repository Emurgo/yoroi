// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, Text} from 'react-native'
import _ from 'lodash'

import {
  amountPendingSelector,
  transactionsSelector,
  isFetchingHistorySelector,
  isOnlineSelector,
} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import Screen from '../../components/Screen'
import TxNavigationButtons from './TxNavigationButtons'
import {updateHistory} from '../../actions'
import {onDidMount} from '../../utils/renderUtils'
import {printAda} from '../../utils/transactions'
import {CONFIG} from '../../config'

import styles from './styles/TxHistory.style'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'

type Props = {
  transactions: {[string]: HistoryTransaction},
  navigation: NavigationScreenProp<NavigationState>,
  isFetching: boolean,
  isOnline: boolean,
  amountPending: ?number,
}

const OfflineBanner = () => (
  <Text>
    You are offline!
  </Text>
)

const RefreshBanner = () => (
  <Text>
    Refreshing...
  </Text>
)

const NoTxHistory = () => (
  <Text> You have no transactions yet ... </Text>
)

const PendingAmount = ({amount}) => (
  <Text> Pending amount: {printAda(amount)} </Text>
)

const TxHistory = ({amountPending, transactions, navigation, isFetching, isOnline}: Props) => (
  <View style={styles.root}>
    {!isOnline && <OfflineBanner />}
    {isFetching && <RefreshBanner />}
    {/* TODO(ppershing): What should we do if amountPending is zero?
      Should we show it? Note that isn't case for intrawallet transactions
      because amountPending is brutto and thus negative due to fee
    */}
    {amountPending && <PendingAmount amount={amountPending} />}
    <Screen scroll>
      {_.isEmpty(transactions)
        ? <NoTxHistory />
        : <TxHistoryList
          navigation={navigation}
          transactions={transactions}
        />
      }
    </Screen>

    <TxNavigationButtons navigation={navigation} />
  </View>
)

export default compose(
  connect((state: State) => ({
    transactions: transactionsSelector(state),
    amountPending: amountPendingSelector(state),
    isFetching: isFetchingHistorySelector(state),
    isOnline: isOnlineSelector(state),
  }), {
    updateHistory,
  }),
  // TODO(ppershing): this should be handled
  // by some history manager
  // FIXME(ppershing): we do not clean interval on unmount
  onDidMount(({updateHistory}) => {
    updateHistory()
    setInterval(updateHistory, CONFIG.HISTORY_REFRESH_TIME)
  }),
)(TxHistory)
