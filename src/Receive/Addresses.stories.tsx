import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {UnusedAddresses, UsedAddresses} from './Addresses'

storiesOf('AddressesList', module)
  .add('unused', () => <UnusedAddresses />)
  .add('used', () => <UsedAddresses />)
