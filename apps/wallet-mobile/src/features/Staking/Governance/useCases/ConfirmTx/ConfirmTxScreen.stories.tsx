import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import {GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SafeArea} from '../../../../../components/SafeArea'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../WalletManager/context/SelectedWalletContext'
import {mocks as governanceMocks} from '../../common'
import {Routes} from '../../common/navigation'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Governance/ConfirmTxScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
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
    <NavigationRouteContext.Provider
      value={getContextValue({kind: 'delegate', drepID: 'drep1e93a2zvs3aw8e4naez0ynpmc48ghx7yaa3n2k8jhwfdt70yscts'})}
    >
      <ConfirmTxScreen />
    </NavigationRouteContext.Provider>
  ))
  .add('Delegate And Register Staking Key', () => (
    <NavigationRouteContext.Provider
      value={getContextValue(
        {kind: 'delegate', drepID: 'drep1e93a2zvs3aw8e4naez0ynpmc48ghx7yaa3n2k8jhwfdt70yscts'},
        true,
      )}
    >
      <ConfirmTxScreen />
    </NavigationRouteContext.Provider>
  ))

const getContextValue = (vote: Routes['staking-gov-confirm-tx']['vote'], registerStakingKey = false) => ({
  key: 'key',
  name: 'name',
  params: {
    vote,
    unsignedTx: mocks.yoroiUnsignedTx,
    registerStakingKey,
  },
})
