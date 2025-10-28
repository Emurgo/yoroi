import type {AnalyticsProvider} from '../types/analytics'

export function createNoopClient(): AnalyticsProvider {
  return {
    navigate: () => {},
    capture: () => {},
    install: () => {},
    identify: () => {},
  }
}
