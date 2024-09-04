import {DecoratorFunction} from '@storybook/addons'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {QueryClientProvider} from 'react-query'

import {queryClientFixture} from '../../../kernel/fixtures/fixtures'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {claimApiMockInstances} from '../../../../../../packages/claim/src/manager.mocks'
import {ClaimProvider} from '../../../../../../packages/claim/src/translators/reactjs/ClaimProvider'
import {mocks as claimMocks} from '../../../../../../packages/claim/src/translators/reactjs/state.mocks'
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
