import {Links} from '@yoroi/types'
import {freeze} from 'immer'

const exchangeShowCreateResultParams: Links.ExchangeShowCreateResultParams = {
  coin: 'ADA',
  coinAmount: 10,
  fiat: 'USD',
  fiatAmount: 100,
  orderType: 'buy',
  provider: 'yoroi',
  status: 'success',
}
const exchangeShowCreateResultResult: Links.ExchangeShowCreateResultParams = {
  coin: 'ADA',
  coinAmount: 10,
  fiat: 'USD',
  fiatAmount: 100,
  orderType: 'buy',
  provider: 'yoroi',
  status: 'success',
}

const transferRequestAdaParams: Links.TransferRequestAdaParams = {
  targets: [
    {
      amounts: [
        {
          quantity: '1000000',
          tokenId: '.',
        },
      ],
      datum: 'DEADDEAD',
      receiver: '$stackchain',
    },
    {
      amounts: [
        {
          quantity: '1000000',
          tokenId: 'exampleTokenId.name2',
        },
      ],
      receiver: 'stackchain.ada',
    },
  ],
}
const transferRequestAdaResult: Links.TransferRequestAdaParams = {
  targets: [
    {
      amounts: [
        {
          quantity: '1000000',
          tokenId: '.',
        },
      ],
      datum: 'DEADDEAD',
      receiver: '$stackchain',
    },
    {
      amounts: [
        {
          quantity: '1000000',
          tokenId: 'exampleTokenId.name2',
        },
      ],
      receiver: 'stackchain.ada',
    },
  ],
}

const transferRequestAdaWithLinkParams: Links.TransferRequestAdaWithLinkParams =
  {
    link: 'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
  }
const transferRequestAdaWithLinkResult: Links.TransferRequestAdaWithLinkParams =
  {
    link: encodeURIComponent(
      'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
    ),
  }

const browserLaunchDappUrlParams: Links.BrowserLaunchDappUrlParams = {
  dappUrl: 'https://cardanospot.io/landing?ref=yoroiwallet.com',
}
const browserLaunchDappUrlResult: Links.BrowserLaunchDappUrlParams = {
  dappUrl: encodeURIComponent(
    'https://cardanospot.io/landing?ref=yoroiwallet.com',
  ),
}

export const mocks = freeze(
  {
    exchangeShowCreateResult: {
      params: exchangeShowCreateResultParams,
      result: exchangeShowCreateResultResult,
    },
    transferRequestAda: {
      params: transferRequestAdaParams,
      result: transferRequestAdaResult,
    },
    transferRequestAdaWithLink: {
      params: transferRequestAdaWithLinkParams,
      result: transferRequestAdaWithLinkResult,
    },
    browserLaunchDappUrl: {
      params: browserLaunchDappUrlParams,
      result: browserLaunchDappUrlResult,
    },
  },
  true,
)
