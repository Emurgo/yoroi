import {DecoratorFunction} from '@storybook/addons'
import {storiesOf} from '@storybook/react-native'
import {claimManagerMockInstances, ClaimProvider, mocksState} from '@yoroi/claim'
import * as React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'

import {queryClientFixture} from '../../../kernel/fixtures/fixtures'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
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
      <ClaimProvider manager={claimManagerMockInstances.error} initialState={mocksState.withClaimTokenProcessing}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
  .add('accepted', () => {
    return (
      <ClaimProvider manager={claimManagerMockInstances.error} initialState={mocksState.withClaimTokenAccepted}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
  .add('done', () => {
    return (
      <ClaimProvider manager={claimManagerMockInstances.error} initialState={mocksState.withClaimTokenDone}>
        <ShowSuccessScreen />
      </ClaimProvider>
    )
  })
