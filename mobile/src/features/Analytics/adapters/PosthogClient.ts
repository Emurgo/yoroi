import type {AnalyticsProvider} from '../types/analytics'

type PlatformTag = 'IOS' | 'Android'

type Properties = Record<string, string | number | boolean | null | string[]>

type Posthog = {
  identify: (userId: string, traits?: Properties) => void
  capture: (event: string, properties?: Properties) => void
}

export class PosthogClient implements AnalyticsProvider {
  private readonly client: Posthog
  private readonly platform: PlatformTag
  private userId?: string

  constructor({client, platform}: {client: Posthog; platform: PlatformTag}) {
    this.client = client
    this.platform = platform
  }

  identify(
    userId?: string,
    traits?: Record<string, string | number | boolean | null | string[]>,
  ) {
    this.userId = userId
    if (userId) this.client.identify(userId, traits)
  }

  navigate(to: string) {
    this.client.capture('navigate', {to, platform: this.platform})
  }

  capture(
    event: string,
    properties?: Record<string, string | number | boolean | null | string[]>,
  ) {
    this.client.capture(event, {
      ...(properties ?? {}),
      platform: this.platform,
    })
  }

  install(campaign: string, source: string) {
    if (this.userId) this.client.identify(this.userId, {campaign, source})
    this.client.capture('Installed', {
      campaign,
      source,
      platform: this.platform,
    })
  }
}
