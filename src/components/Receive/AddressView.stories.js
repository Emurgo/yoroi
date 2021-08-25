// @flow

import React from 'react'
import {storiesOf} from '@storybook/react-native'

import AddressView from './AddressView'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {mockState} from '../../state'

const externalAddresses = mockState().wallet.externalAddresses

const freshAddressInfo: AddressDTOCardano = ({
  address: externalAddresses[0],
  getWasmAddress: () => Promise.resolve('wasmAddress'),
  getKeyHashes: () => ({
    spending: 'spending',
    staking: 'staking',
  }),
}: any)

const usedAddressInfo: AddressDTOCardano = ({
  address: externalAddresses[1],
  getWasmAddress: () => Promise.resolve('wasmAddress'),
  getKeyHashes: () => ({
    spending: 'spending',
    staking: 'staking',
  }),
}: any)

storiesOf('AddressView', module)
  .add('unused', () => <AddressView addressInfo={freshAddressInfo} />)
  .add('used', () => <AddressView addressInfo={usedAddressInfo} />)
