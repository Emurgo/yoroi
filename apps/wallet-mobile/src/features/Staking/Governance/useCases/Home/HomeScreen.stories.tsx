import {storiesOf} from '@storybook/react-native'
import {GovernanceManager, GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SafeArea} from '../../../../../components/SafeArea'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as governanceMocks} from '../../common/mocks'
import {HomeScreen} from './HomeScreen'

const walletMock = {
  ...mocks.wallet,
  getStakingInfo: () => Promise.resolve({status: 'not-registered' as const}),
}

storiesOf('Governance/HomeScreen', module)
  .addDecorator((story) => <SafeArea>{story()}</SafeArea>)
  .add('Default', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve({}),
    }

    return (
      <Wrapper manager={manager} wallet={walletMock}>
        <HomeScreen />
      </Wrapper>
    )
  })
  .add('Loading TX', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => {
        return {
          kind: 'vote',
          vote: 'no-confidence',
          txID: 'txID',
        }
      },
    }
    return (
      <Wrapper manager={manager} wallet={walletMock}>
        <HomeScreen />
      </Wrapper>
    )
  })
  .add('Voted DRep Delegation', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedDrepStakeKeyState),
    }
    return (
      <Wrapper manager={manager} wallet={walletMock}>
        <HomeScreen />
      </Wrapper>
    )
  })
  .add('Voted No Confidence', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedNoConfidenceStakeKeyState),
    }

    return (
      <Wrapper manager={manager} wallet={walletMock}>
        <HomeScreen />
      </Wrapper>
    )
  })

  .add('Voted Abstain', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve(governanceMocks.votedAbstainStakeKeyState),
    }

    return (
      <Wrapper manager={manager} wallet={walletMock}>
        <HomeScreen />
      </Wrapper>
    )
  })
  .add('HW', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve({}),
    }

    const wallet = {
      ...walletMock,
      isHW: true,
    }

    return (
      <Wrapper manager={manager} wallet={wallet}>
        <HomeScreen />
      </Wrapper>
    )
  })

const Wrapper = ({
  children,
  manager,
  wallet,
}: {
  children: React.ReactNode
  manager: GovernanceManager
  wallet: YoroiWallet
}) => {
  return (
    <WalletManagerProviderMock wallet={wallet}>
      <GovernanceProvider manager={manager}>{children}</GovernanceProvider>
    </WalletManagerProviderMock>
  )
}
