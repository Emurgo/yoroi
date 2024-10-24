import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModalProps} from '../../../../.storybook/decorators'
import {LedgerTransportSwitch} from './LedgerTransportSwitchModal'

storiesOf('Ledger Transport Switch Modal', module).add('default', () => (
  <WithModalProps>
    {({onPress, ...props}) => (
      <LedgerTransportSwitch {...props} onSelectUSB={onPress('USB selected')} onSelectBLE={onPress('BLE selected')} />
    )}
  </WithModalProps>
))
