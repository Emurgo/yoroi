import type {AnalyticsProvider} from '../types/analytics'

type SDK = {
  identify: (
    userId: string,
    traits?: Record<string, string | number | boolean | null | string[]>,
  ) => void
  reset?: () => void
  capture: (
    event: string,
    properties?: Record<string, string | number | boolean | null | string[]>,
  ) => void
}

export function createPosthogClient({sdk}: {sdk: SDK}): AnalyticsProvider {
  let currentUserId: string | undefined
  return {
    navigate: (to) => sdk.capture('navigate', {to}),
    capture: (event, properties) => sdk.capture(event, properties),
    install: (campaign, source) => {
      if (currentUserId) sdk.identify(currentUserId, {campaign, source})
    },
    identify: (userId, traits) => {
      const hasValidUserId = typeof userId === 'string' && userId.trim() !== ''
      if (hasValidUserId) {
        currentUserId = userId
        sdk.identify(userId, traits)
        return
      }
      currentUserId = undefined
      if (sdk.reset) sdk.reset()
    },
  }
}
