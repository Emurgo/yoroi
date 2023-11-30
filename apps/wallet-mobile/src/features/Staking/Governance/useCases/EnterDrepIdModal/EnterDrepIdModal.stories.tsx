import {storiesOf} from '@storybook/react-native'
import {GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {mocks as governanceMocks} from '../../common'
import {EnterDrepIdModal} from './EnterDrepIdModal'

storiesOf('Governance/EnterDrepIdModal', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <GovernanceProvider manager={governanceMocks.governanceManager}>{story()}</GovernanceProvider>
    </SelectedWalletProvider>
  ))
  .add('Default', () => <EnterDrepIdModal />)
