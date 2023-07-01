import * as React from 'react'
import {Metrics} from '@yoroi/types'
import {QueryClient, QueryClientProvider} from 'react-query'
import TestRenderer from 'react-test-renderer'

import {MetricsProvider, useMetrics} from './reactjs'
import {makeMockMetrics, makeMockMetricsStorage} from '../adapters/mocks'

const {act: componentAct} = TestRenderer

describe('MetricsProvider', () => {
  it('provides metrics context', () => {
    const metrics: Metrics.Module<any> = makeMockMetrics({
      apiKey: 'test-api-key',
    })
    const storage: Metrics.Storage = makeMockMetricsStorage()

    const TestComponent = () => {
      metricsContext = useMetrics()
      return null
    }

    let metricsContext
    componentAct(() => {
      TestRenderer.create(
        <QueryClientProvider client={new QueryClient()}>
          <MetricsProvider metrics={metrics} storage={storage}>
            <TestComponent />
          </MetricsProvider>
        </QueryClientProvider>,
      )
    })

    expect(metricsContext).toEqual({
      ...metrics,
      ...storage,
      sessionId: expect.any(Number),
      sessionIdChanged: expect.any(Function),
    })
  })
})
