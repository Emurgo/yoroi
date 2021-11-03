import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {TxListActionsBannerForAssetsTab, TxListActionsBannerForTransactionsTab} from './TxListActionsBanner'

storiesOf('V2/TxHistory/TxListActionsBanner', module)
  .add('Assets', () => (
    <TxListActionsBannerForAssetsTab
      onPressNFTs={action('NFTs')}
      onPressTokens={action('Tokens')}
      onSearch={action('Search')}
      nftsLabel="NFTs (2)"
      tokensLabel="Tokens (200)"
    />
  ))
  .add('Transactions', () => (
    <TxListActionsBannerForTransactionsTab onSearch={action('Search')} onExport={action('Export')} />
  ))
