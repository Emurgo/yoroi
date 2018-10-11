// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View, Text} from 'react-native'

import {transactionsSelector, isFetchingHistorySelector} from '../../selectors'
import TxHistoryList from './TxHistoryList'
import Screen from '../../components/Screen'
import TxNavigationButtons from './TxNavigationButtons'

import styles from './styles/TxHistory.style'
import {updateHistory} from '../../actions'
import {onDidMount} from '../../utils/renderUtils'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'

type Props = {
  transactions: Array<HistoryTransaction>,
  navigation: NavigationScreenProp<NavigationState>,
  isFetching: boolean,
}

const TxHistory = ({transactions, navigation, isFetching}: Props) => (
  <View style={styles.root}>
    {isFetching && <Text>'Refreshing...'</Text>}
    <Screen scroll>
      <TxHistoryList navigation={navigation} transactions={transactions} />
    </Screen>

    <TxNavigationButtons navigation={navigation} />
  </View>
)

export default compose(
  connect((state: State) => ({
    transactions: transactionsSelector(state),
    isFetching: isFetchingHistorySelector(state),
  }), {
    updateHistory,
  }),
  onDidMount(({updateHistory}) => updateHistory()),
)(TxHistory)
