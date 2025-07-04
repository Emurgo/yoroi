import {storiesOf} from '@storybook/react-native'
import {GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {mocks} from '../../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../wallets/mocks/WalletManagerProviderMock'
import {mocks as governanceMocks} from '../../common/mocks'
import {EnterDrepIdModal} from './EnterDrepIdModal'

storiesOf('Governance/EnterDrepIdModal', module)
  .addDecorator((story) => (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <GovernanceProvider manager={governanceMocks.governanceManager}>
        {story()}
      </GovernanceProvider>
    </WalletManagerProviderMock>
  ))
  .add('Default', () => <EnterDrepIdModal />)
