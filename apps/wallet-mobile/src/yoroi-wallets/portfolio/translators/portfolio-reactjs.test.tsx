import {act, fireEvent, render} from '@testing-library/react-native'
import React from 'react'
import {Button, Text, View} from 'react-native'

import {mocksPortolioManager} from '../portfolio-manager.mocks'
import {PortfolioProvider, usePortfolio} from './portfolio-reactjs'

const mockPortfolioManager = mocksPortolioManager.mockPortfolioManager

const TestComponent = () => {
  const portfolio = usePortfolio()
  return (
    <View>
      <Text testID="primary">{portfolio.primary.amounts['']}</Text>

      <Text testID="token">{portfolio.primary.tokens['']?.info?.name}</Text>

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
    </View>
  )
}

describe('PortfolioProvider and usePortfolio', () => {
  it('should change amounts when the button is pressed', async () => {
    const {findByText, findByTestId} = render(
      <PortfolioProvider portfolioManager={mockPortfolioManager}>
        <TestComponent />
      </PortfolioProvider>,
    )

    const changeTokensButton = await findByText('Change Tokens')
    act(() => {
      fireEvent.press(changeTokensButton)
    })

    const changeAmountsButton = await findByText('Change Amounts')
    act(() => {
      fireEvent.press(changeAmountsButton)
    })

    // Order matters since the pts are expected to be there before any pts update
    const primary = await findByTestId('primary')
    expect(primary.props.children).toBe('100')

    const token = await findByTestId('token')
    expect(token.props.children).toBe('Primary Token')
  })
})
