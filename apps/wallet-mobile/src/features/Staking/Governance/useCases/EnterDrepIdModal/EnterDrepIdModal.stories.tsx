import {storiesOf} from '@storybook/react-native'
import {GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {mocks} from '../../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as governanceMocks} from '../../common'
import {EnterDrepIdModal} from './EnterDrepIdModal'

storiesOf('Governance/EnterDrepIdModal', module)
  .addDecorator((story) => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <GovernanceProvider manager={governanceMocks.governanceManager}>{story()}</GovernanceProvider>
    </WalletManagerProviderMock>
  ))
  .add('Default', () => <EnterDrepIdModal />)
