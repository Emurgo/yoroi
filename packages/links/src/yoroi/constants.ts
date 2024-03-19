import {Links} from '@yoroi/types'

export const configYoroiTransferRequestAda: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'transfer/request/ada',
}

export const configYoroiTransferRequestAdaWithLink: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'transfer/request/ada-with-link',
}

export const configYoroiOrderShowCreateResult: Readonly<
  Omit<Links.YoroiUriConfig, 'scheme'>
> = {
  authority: 'yoroi-wallet.com',
  version: 'w1',
  path: 'exchange/order/show-create-result',
}
