import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {ActionsBanner} from './ActionsBanner'

storiesOf('V2/AssetList/ActionsBanner', module).add('Transactions', () => (
  <ActionsBanner
    onPressNFTs={action('NFTs')}
    onPressTokens={action('Tokens')}
    onSearch={action('Search')}
    nftsLabel="NFTs (2)"
    tokensLabel="Tokens (200)"
  />
))
