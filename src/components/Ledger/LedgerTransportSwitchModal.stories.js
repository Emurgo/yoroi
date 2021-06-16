// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'
import {action} from '@storybook/addon-actions'
import StorybookModalWrapper from '../Common/StorybookModalWrapper'

import LedgerTransportSwitchModal from './LedgerTransportSwitchModal'

const StatefulModal = StorybookModalWrapper(LedgerTransportSwitchModal)

storiesOf('Ledger Transport Switch Modal', module).add('default', () => (
  <StatefulModal
    onPress={() => action('clicked')()}
    onSelectUSB={() => action('USB selected')()}
    onSelectBLE={() => action('BLE selected')()}
  />
))
