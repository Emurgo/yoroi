import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {ChangeVoteScreen} from './ChangeVoteScreen'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {GovernanceManager, GovernanceProvider} from '@yoroi/staking'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as governanceMocks} from '../../common'

storiesOf('Governance/ChangeVoteScreen', module)
  .add('When Delegated', () => {
    const manager = governanceMocks.governanceManager
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions() {
        return {
          [governanceMocks.votingDelegationTxInfo.id]: governanceMocks.votingDelegationTxInfo,
        }
      },
    }
    return (
      <Wrapper manager={manager} wallet={wallet}>
        <ChangeVoteScreen />
      </Wrapper>
    )
  })
  .add('When Voted Abstain', () => {
    const manager = governanceMocks.governanceManager
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions() {
        return {
          [governanceMocks.votingAbstainTxInfo.id]: governanceMocks.votingAbstainTxInfo,
        }
      },
    }
    return (
      <Wrapper manager={manager} wallet={wallet}>
        <ChangeVoteScreen />
      </Wrapper>
    )
  })
  .add('When Voted No Confidence', () => {
    const manager = governanceMocks.governanceManager
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      get transactions() {
        return {
          [governanceMocks.votingNoConfidenceTxInfo.id]: governanceMocks.votingNoConfidenceTxInfo,
        }
      },
    }
    return (
      <Wrapper manager={manager} wallet={wallet}>
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
