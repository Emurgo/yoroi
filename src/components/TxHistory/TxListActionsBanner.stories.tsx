import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Alert} from 'react-native'

import {TxListActionsBanner} from './TxListActionsBanner'

const fakePress =
  (title = 'Title', message = 'Message') =>
  () =>
    Alert.alert(title, message)

storiesOf('V2/TxHistory/TxListActionsBanner', module)
  .add('Assets', () => (
    <TxListActionsBanner
      actions="assets"
      onPressNFTs={fakePress('NFTs')}
      onPressTokens={fakePress('Tokens')}
      onSearch={fakePress('Search')}
    />
  ))
  .add('Transactions', () => (
    <TxListActionsBanner actions="txs" onSearch={fakePress('Search')} onExport={fakePress('Export')} />
  ))
