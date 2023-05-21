import {makeMockMetrics} from '../adapters/mocks'
import {makeAmplitudeMetrics} from '../adapters/amplitude'

export function getMetricsFactory(metrics: 'amplitude' | 'mock') {
  switch (metrics) {
    case 'amplitude':
      return makeAmplitudeMetrics
    case 'mock':
      return makeMockMetrics
  }
}
