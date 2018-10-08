// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import TxHistoryList from './TxHistoryList'
import Screen from '../../components/Screen'
import TxNavigationButtons from './TxNavigationButtons'

import styles from './TxHistory.style'

type Props = {
  text: string,
  transactions: Array<HistoryTransaction>,
  navigation: NavigationScreenProp<NavigationState>
};

const TxHistory = ({transactions, navigation}: Props) => (
  <View style={styles.root}>
    <Screen scroll>
      <TxHistoryList navigation={navigation} transactions={transactions} />
    </Screen>

    <TxNavigationButtons navigation={navigation} />
  </View>
)

export default compose(
  connect((state) => ({
    transactions: state.transactions,
  })),
)(TxHistory)
