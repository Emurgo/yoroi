// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'

import LedgerSwitchModal from './LedgerSwitchModal'

storiesOf('Ledger Switch Modal', module).add('default', () => (
  <LedgerSwitchModal onPress={(e) => action('clicked')} />
))
