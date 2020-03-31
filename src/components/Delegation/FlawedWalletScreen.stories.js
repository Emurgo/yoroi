// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import FlawedWalletScreen from './FlawedWalletScreen'

storiesOf('Flawed Wallet Screen', module)
  .add('default', () => (
    <FlawedWalletScreen
      onPress={(e) => action('clicked')}
      onRequestClose={(e) => action('clicked')}
      disableButtons={false}
    />
  ))
