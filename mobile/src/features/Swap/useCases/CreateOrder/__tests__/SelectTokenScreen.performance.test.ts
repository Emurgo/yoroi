import {render, fireEvent, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {performance} from 'perf_hooks'

import {SelectTokenScreen} from '../SelectTokenScreen'

// Mock dependencies
jest.mock('~/features/Portfolio/common/hooks/usePortfolioBalances', () => ({
  usePortfolioBalances: () => ({
    all: generateMockTokens(100), // Generate 100 mock tokens
  }),
}))

jest.mock('~/features/Swap/common/useSwap', () => ({
  useSwap: () => ({
    tokenInfos: new Map(generateMockTokenInfos(100)),
    tokenInInput: {tokenId: null, isTouched: false},
    tokenOutInput: {tokenId: null, isTouched: false},
    action: jest.fn(),
  }),
}))

jest.mock('~/features/Portfolio/context/PortfolioTokenActivityProvider', () => ({
  usePortfolioTokenActivity: () => ({
    tokenActivity: generateMockTokenActivity(100),
  }),
}))

// Mock data generators
function generateMockTokens(count: number) {
  return Array.from({length: count}, (_, i) => ({
    info: {
      id: `token-${i}`,
      name: `Token ${i}`,
      ticker: `TKN${i}`,
      type: 'ft' as const,
      status: 'valid' as const,
    },
    quantity: BigInt(1000000),
  }))
}

function generateMockTokenInfos(count: number) {
  return Array.from({length: count}, (_, i) => [
    `token-${i}`,
    {
      id: `token-${i}`,
      name: `Token ${i}`,
      ticker: `TKN${i}`,
      type: 'ft' as const,
      status: 'valid' as const,
    },
  ])
}

function generateMockTokenActivity(count: number) {
  const activity: Record<string, any> = {}
  for (let i = 0; i < count; i++) {
    activity[`token-${i}`] = {
      price: {close: Math.random() * 100},
    }
  }
  return activity
}

describe('SelectTokenScreen Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render token list within performance budget', async () => {
    const startTime = performance.now()

    const {getByTestId} = render(<SelectTokenScreen />)

    await waitFor(() => {
      expect(getByTestId('assetsList')).toBeTruthy()
    })

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Performance budget: should render in under 100ms
    expect(renderTime).toBeLessThan(100)
  })

  it('should handle search filtering efficiently', async () => {
    const {getByTestId, getByPlaceholderText} = render(<SelectTokenScreen />)

    const searchInput = getByPlaceholderText('Search tokens')
    const startTime = performance.now()

    // Simulate typing search term
    fireEvent.changeText(searchInput, 'Token 1')

    await waitFor(() => {
      // Wait for filtering to complete
    })

    const endTime = performance.now()
    const searchTime = endTime - startTime

    // Performance budget: search should complete in under 50ms
    expect(searchTime).toBeLessThan(50)
  })

  it('should handle large token lists efficiently', async () => {
    // Test with larger dataset
    const largeTokenCount = 500
    jest.doMock('~/features/Portfolio/common/hooks/usePortfolioBalances', () => ({
      usePortfolioBalances: () => ({
        all: generateMockTokens(largeTokenCount),
      }),
    }))

    const startTime = performance.now()

    const {getByTestId} = render(<SelectTokenScreen />)

    await waitFor(() => {
      expect(getByTestId('assetsList')).toBeTruthy()
    })

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Performance budget: should handle 500 tokens in under 200ms
    expect(renderTime).toBeLessThan(200)
  })

  it('should maintain performance during scrolling', async () => {
    const {getByTestId} = render(<SelectTokenScreen />)

    const list = getByTestId('assetsList')

    // Simulate scrolling
    const startTime = performance.now()

    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: {y: 1000},
        contentSize: {height: 2000, width: 100},
        layoutMeasurement: {height: 400, width: 100},
      },
    })

    await waitFor(() => {
      // Wait for scroll to complete
    })

    const endTime = performance.now()
    const scrollTime = endTime - startTime

    // Performance budget: scroll should be smooth (under 16ms for 60fps)
    expect(scrollTime).toBeLessThan(16)
  })

  it('should handle token selection efficiently', async () => {
    const {getByTestId, getAllByTestId} = render(<SelectTokenScreen />)

    await waitFor(() => {
      expect(getByTestId('assetsList')).toBeTruthy()
    })

    const tokenButtons = getAllByTestId('selectTokenButton')
    const startTime = performance.now()

    // Simulate token selection
    fireEvent.press(tokenButtons[0])

    const endTime = performance.now()
    const selectionTime = endTime - startTime

    // Performance budget: token selection should be instant (under 50ms)
    expect(selectionTime).toBeLessThan(50)
  })
})

// Performance monitoring utilities
export const measurePerformance = (fn: () => void) => {
  const startTime = performance.now()
  fn()
  const endTime = performance.now()
  return endTime - startTime
}

export const benchmarkOperation = async (
  operation: () => Promise<void>,
  iterations: number = 10
) => {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()
    await operation()
    const endTime = performance.now()
    times.push(endTime - startTime)
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  return {
    averageTime,
    minTime,
    maxTime,
    times,
  }
}
