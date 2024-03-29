import {storiesOf} from '@storybook/react-native'
import {GovernanceManager, GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {mocks as governanceMocks, SafeArea} from '../../common'
import {ChangeVoteScreen} from './ChangeVoteScreen'

storiesOf('Governance/ChangeVoteScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('When Delegated To A Drep', () => {
    const manager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedDrepStakeKeyState),
    }

    return (
      <Wrapper manager={manager} wallet={mocks.wallet}>
        <ChangeVoteScreen />
      </Wrapper>
    )
  })
  .add('When Voted Abstain', () => {
    const manager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedAbstainStakeKeyState),
    }
    return (
      <Wrapper manager={manager} wallet={mocks.wallet}>
        <ChangeVoteScreen />
      </Wrapper>
    )
  })
  .add('When Voted No Confidence', () => {
    const manager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedNoConfidenceStakeKeyState),
    }
    return (
      <Wrapper manager={manager} wallet={mocks.wallet}>
        <ChangeVoteScreen />
      </Wrapper>
    )
  })

const Wrapper = ({
  children,
  manager,
  wallet = mocks.wallet,
}: {
  children: React.ReactNode
  manager: GovernanceManager
  wallet?: YoroiWallet
}) => {
  return (
    <SelectedWalletProvider wallet={wallet}>
      <GovernanceProvider manager={manager}>{children}</GovernanceProvider>
    </SelectedWalletProvider>
  )
}
