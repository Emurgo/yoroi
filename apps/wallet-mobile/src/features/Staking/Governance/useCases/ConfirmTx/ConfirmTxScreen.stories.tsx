import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {Routes} from '../../common/navigation'
import {ConfirmTxScreen} from './ConfirmTxScreen'
import {GovernanceProvider} from '@yoroi/staking'
import {mocks as governanceMocks} from '../../common'

storiesOf('Governance/ConfirmTxScreen', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <GovernanceProvider manager={governanceMocks.governanceManager}>{story()}</GovernanceProvider>
    </SelectedWalletProvider>
  ))
  .add('Abstain', () => (
    <NavigationRouteContext.Provider value={getContextValue({kind: 'abstain'})}>
      <ConfirmTxScreen />
    </NavigationRouteContext.Provider>
  ))
  .add('No Confidence', () => (
    <NavigationRouteContext.Provider value={getContextValue({kind: 'no-confidence'})}>
      <ConfirmTxScreen />
    </NavigationRouteContext.Provider>
  ))
  .add('Delegate', () => (
    <NavigationRouteContext.Provider value={getContextValue({kind: 'delegate', drepID: 'drep1abcdef'})}>
      <ConfirmTxScreen />
    </NavigationRouteContext.Provider>
  ))

const getContextValue = (vote: Routes['confirm-tx']['vote']) => ({
  key: 'key',
  name: 'name',
  params: {
    vote,
    unsignedTx: mocks.yoroiUnsignedTx,
  },
})
