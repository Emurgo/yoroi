// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {BigNumber} from 'bignumber.js'
import React from 'react'

import {type TokenEntry} from '../../crypto/MultiToken'
import SendScreen from './SendScreen'

storiesOf('SendScreen', module)
  .add('Default', () => {
    const selectedAsset: TokenEntry = {
      networkId: 300,
      identifier: '',
      amount: new BigNumber(12344.00234523),
    }

    return <SendScreen sendAll={false} onSendAll={action('onSendAll')} selectedAsset={selectedAsset} />
  })
  .add('sendAll', () => {
    const selectedAsset: TokenEntry = {
      networkId: 300,
      identifier: '',
      amount: new BigNumber(12344.00234523),
    }

    return <SendScreen sendAll={true} onSendAll={action('onSendAll')} selectedAsset={selectedAsset} />
  })
