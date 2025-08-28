export type ExchangeProvider = {
  id: string
  name: string
  supportedOrders: {
    sell?: {
      fee: number
      max?: number
      min?: number
    }
    buy?: {
      fee: number
      max?: number
      min?: number
    }
  }
  appId: string
  // TODO: revisit on v4.27
  logo: string // add later - base64
  supportUrl?: string // add later
}
