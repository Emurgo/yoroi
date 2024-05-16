import {Links} from '@yoroi/types'

export const configYoroiTransferRequestAda: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'transfer/request/ada',
} as const

export const configYoroiTransferRequestAdaWithLink: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'transfer/request/ada-with-link',
} as const

export const configYoroiExchangeOrderShowCreateResult: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'exchange/order/show-create-result',
} as const

export const supportedPrefixes = [
  'yoroi://',
  'https://yoroi-wallet.com/w1',
] as const
