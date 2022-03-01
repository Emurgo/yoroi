import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../storybook'
import {LedgerTransportSwitchModal} from './LedgerTransportSwitchModal'

storiesOf('Ledger Transport Switch Modal', module).add('default', () => (
  <WithModalProps>
    {({onPress, ...props}) => (
      <LedgerTransportSwitchModal
        {...props}
        showCloseIcon
        onSelectUSB={onPress('USB selected')}
        onSelectBLE={onPress('BLE selected')}
      />
    )}
  </WithModalProps>
))
