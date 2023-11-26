import {storiesOf} from '@storybook/react-native'
import {GovernanceManager, GovernanceProvider} from '@yoroi/staking'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {mocks as governanceMocks} from '../../common'
import {HomeScreen} from './HomeScreen'

storiesOf('Governance/HomeScreen', module)
  .add('Default', () => (
    <Wrapper manager={governanceMocks.governanceManager}>
      <HomeScreen />
    </Wrapper>
  ))
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
    }
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions(): Record<string, TransactionInfo> {
        return {[governanceMocks.votingDelegationTxInfo.id]: governanceMocks.votingDelegationTxInfo}
      },
    }
    return (
      <Wrapper manager={manager} wallet={wallet}>
        <HomeScreen />
      </Wrapper>
    )
  })
  .add('Voted No Confidence', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
    }
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions(): Record<string, TransactionInfo> {
        return {[governanceMocks.votingNoConfidenceTxInfo.id]: governanceMocks.votingNoConfidenceTxInfo}
      },
    }
    return (
      <Wrapper manager={manager} wallet={wallet}>
        <HomeScreen />
      </Wrapper>
    )
  })

  .add('Voted Abstain', () => {
    const manager: GovernanceManager = {
      ...governanceMocks.governanceManager,
      getLatestGovernanceAction: async () => null,
    }
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions(): Record<string, TransactionInfo> {
        return {[governanceMocks.votingAbstainTxInfo.id]: governanceMocks.votingAbstainTxInfo}
      },
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
