// @flow

import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import FlawedWalletScreen from './FlawedWalletScreen'

storiesOf('Flawed Wallet Screen', module).add('default', () => (
  <FlawedWalletScreen onPress={() => action('clicked')()} disableButtons={false} />
))
