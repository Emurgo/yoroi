// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import AddressesList from './AddressesList'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {mockState} from '../../state'

const externalAddresses = mockState().wallet.externalAddresses

const addressInfos: Map<string, AddressDTOCardano> = new Map(
  externalAddresses.map((addr) => [addr, new AddressDTOCardano(addr)]),
)

storiesOf('AddressesList', module)
  .add('unused', () => <AddressesList addresses={addressInfos} showFresh />)
  .add('used', () => <AddressesList addresses={addressInfos} />)
