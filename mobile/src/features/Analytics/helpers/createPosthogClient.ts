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
  flush?: () => Promise<void>
}

export function createPosthogClient({sdk}: {sdk: SDK}): AnalyticsProvider {
  let currentUserId: string | undefined
  return {
    navigate: (to) => {
      sdk.capture('navigate', {to})
      sdk.flush?.()
    },
    capture: (event, properties) => {
      sdk.capture(event, properties)
      sdk.flush?.()
    },
    install: (campaign, source) => {
      if (currentUserId) sdk.identify(currentUserId, {campaign, source})
    },
    identify: (userId, traits) => {
      const hasValidUserId = userId && userId.length > 0
      if (hasValidUserId) {
        currentUserId = userId
        sdk.identify(userId, traits)
        sdk.flush?.()
        return
      }
      currentUserId = undefined
    },
  }
}
