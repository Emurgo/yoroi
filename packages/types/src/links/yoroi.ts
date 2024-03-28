export interface LinksYoroiUriConfig {
  readonly scheme: 'yoroi' | 'https'
  readonly authority: 'yoroi-wallet.com'
  readonly version: 'w1'
  readonly path:
    | 'exchange/order/show-create-result'
    | 'transfer/request/ada'
    | 'transfer/request/ada-with-link'
}

export type LinksPartnerInfoParams = {
  isSandbox?: boolean
  isTestnet?: boolean
  appId?: string
  message?: string
  walletId?: string
  authorization?: string
  signature?: string
  redirectTo?: string
}

export type LinksExchangeShowCreateResultParams = LinksPartnerInfoParams & {
  provider: string
  orderType: 'buy' | 'sell'
  coinAmount?: number
  coin?: string
  fiatAmount?: number
  fiat?: string
  status?: 'success' | 'pending' | 'failed'
}

export type LinksTransferRequestAdaWithLinkParams = LinksPartnerInfoParams & {
  link: string
}

export type LinksTransferRequestAdaParams = LinksPartnerInfoParams & {
  targets: ReadonlyArray<{
    receiver: string
    datum?: string
    amounts: ReadonlyArray<{
      tokenId: string
      quantity: string
    }>
  }>
  memo?: string
}

export type LinksYoroiActionInfo =
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada-with-link'
      params: LinksTransferRequestAdaWithLinkParams
    }
  | {
      version: 1
      feature: 'transfer'
      useCase: 'request/ada'
      params: LinksTransferRequestAdaParams
    }
  | {
      version: 1
      feature: 'exchange'
      useCase: 'order/show-create-result'
      params: LinksExchangeShowCreateResultParams
    }

export type LinksYoroiAction = {
  info: LinksYoroiActionInfo
  isTrusted: boolean
}

export type LinksYoroiModule = Readonly<{
  exchange: {
    order: {
      showCreateResult(
        params: Readonly<LinksExchangeShowCreateResultParams>,
      ): string
    }
  }
  transfer: {
    request: {
      ada(params: Readonly<LinksTransferRequestAdaParams>): string
      adaWithLink(
        params: Readonly<LinksTransferRequestAdaWithLinkParams>,
      ): string
    }
  }
}>
