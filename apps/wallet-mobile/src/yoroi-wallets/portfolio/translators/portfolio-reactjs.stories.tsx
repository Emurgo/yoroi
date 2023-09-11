import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {Button, Text, View} from 'react-native'
import {QueryClient, QueryClientProvider} from 'react-query'

import {Boundary} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet/Context/SelectedWalletContext'
import {mocks} from '../../mocks/wallet'
import {mocksPortolioManager} from '../portfolio-manager.mocks'
import {PortfolioProvider, usePortfolio} from './portfolio-reactjs'

storiesOf('Portfolio Provider', module).add('Playground', () => (
  <QueryClientProvider client={new QueryClient()}>
    <SelectedWalletProvider wallet={mocks.wallet}>
      <PortfolioProvider portfolioManager={mockPortfolioManager}>
        <Boundary>
          <Playground />
        </Boundary>
      </PortfolioProvider>
    </SelectedWalletProvider>
  </QueryClientProvider>
))
const mockPortfolioManager = mocksPortolioManager.mockPortfolioManager

const Playground = () => {
  const portfolio = usePortfolio()
  return (
    <View>
      <Text testID="primary">Primary Balance: {portfolio.primary.amounts['']}</Text>

      <Text testID="token">Primary Ticker: {portfolio.primary.tokens['']?.info?.ticker}</Text>

      <Button
        title="Change Amounts"
        onPress={() =>
          portfolio.primaryAmountsChanged({
            ['']: '100',
          })
        }
      />

      <Button
        title="Change Tokens"
        onPress={() =>
          portfolio.primaryTokensChanged({
            ['']: {
              info: {
                name: 'Primary Token',
                kind: 'ft',
                ticker: 'TADA',
                decimals: 6,
                symbol: 'ADA',
                group: '',
                id: '',
                fingerprint: '',
              },
              metadatas: {},
            },
          })
        }
      />

      <Text>{JSON.stringify(portfolio.primary)}</Text>

      <Text>{JSON.stringify(portfolio.secondary)}</Text>
    </View>
  )
}
