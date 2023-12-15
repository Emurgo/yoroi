import {storiesOf} from '@storybook/react-native'
import {GovernanceManager, GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../../yoroi-wallets/mocks'

import {mocks as governanceMocks} from '../../common'
import {HomeScreen} from './HomeScreen'

storiesOf('Governance/HomeScreen', module)
  .add('Default', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
      getStakingKeyState: () => Promise.resolve({}),
    }

    const wallet = {
      ...mocks.wallet,
      getStakingInfo: () => Promise.resolve({status: 'not-registered' as const}),
    }

    return (
      <Wrapper manager={manager} wallet={wallet}>
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
      <Wrapper manager={manager}>
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
      <Wrapper manager={manager} wallet={mocks.wallet}>
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
      <Wrapper manager={manager} wallet={mocks.wallet}>
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
      <Wrapper manager={manager} wallet={mocks.wallet}>
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
      ...mocks.wallet,
      getStakingInfo: () => Promise.resolve({status: 'not-registered' as const}),
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
