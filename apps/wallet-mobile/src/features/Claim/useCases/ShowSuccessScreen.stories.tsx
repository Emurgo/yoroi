import {DecoratorFunction} from '@storybook/addons'
import {storiesOf} from '@storybook/react-native'
import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'

import {queryClientFixture} from '../../../kernel/fixtures/fixtures'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {claimApiMockInstances} from '../module/api.mocks'
import {ClaimProvider} from '../module/ClaimProvider'
import {mocks as claimMocks} from '../module/state.mocks'
import {ShowSuccessScreen} from './ShowSuccessScreen'

const AppDecorator: DecoratorFunction<React.ReactNode> = (story) => {
  return (
    <QueryClientProvider client={queryClientFixture()}>
      <WalletManagerProviderMock wallet={walletMocks.wallet}>{story()}</WalletManagerProviderMock>
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
