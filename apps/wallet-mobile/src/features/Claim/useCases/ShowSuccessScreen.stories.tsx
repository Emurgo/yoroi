import {DecoratorFunction} from '@storybook/addons'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClientProvider} from 'react-query'

import {queryClientFixture} from '../../../utils/fixtures'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../Wallet/common/Context'
import {claimApiMockInstances} from '../module/api.mocks'
import {ClaimProvider} from '../module/ClaimProvider'
import {mocks as claimMocks} from '../module/state.mocks'
import {ShowSuccessScreen} from './ShowSuccessScreen'

const AppDecorator: DecoratorFunction<React.ReactNode> = (story) => {
  return (
    <QueryClientProvider client={queryClientFixture()}>
      <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>
    </QueryClientProvider>
  )
}

storiesOf('Claim ShowSuccessScreen', module)
  .addDecorator(AppDecorator)
  .add('processing', () => {
    return (
      <ClaimProvider claimApi={claimApiMockInstances.error} initialState={claimMocks.withClaimTokenProcessing}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
  .add('accepted', () => {
    return (
      <ClaimProvider claimApi={claimApiMockInstances.error} initialState={claimMocks.withClaimTokenAccepted}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
  .add('done', () => {
    return (
      <ClaimProvider claimApi={claimApiMockInstances.error} initialState={claimMocks.withClaimTokenDone}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
