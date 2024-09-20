import {NavigationRouteContext} from '@react-navigation/core'
import {storiesOf} from '@storybook/react-native'
import {GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SafeArea} from '../../../../../components/SafeArea'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as governanceMocks} from '../../common/mocks'
import {Routes} from '../../common/navigation'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Governance/ConfirmTxScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .addDecorator((story) => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <GovernanceProvider manager={governanceMocks.governanceManager}>{story()}</GovernanceProvider>
    </WalletManagerProviderMock>
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
