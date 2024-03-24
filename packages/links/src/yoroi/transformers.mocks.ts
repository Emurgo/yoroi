import {freeze} from 'immer'
import {
  LinksExchangeShowCreateResultParams,
  LinksTransferRequestAdaParams,
  LinksTransferRequestAdaWithLinkParams,
} from './types'

const exchangeShowCreateResultParams: LinksExchangeShowCreateResultParams = {
  coin: 'ADA',
  coinAmount: 10,
  fiat: 'USD',
  fiatAmount: 100,
  orderType: 'buy',
  provider: 'yoroi',
  status: 'success',
}
const exchangeShowCreateResultResult: LinksExchangeShowCreateResultParams = {
  coin: 'ADA',
  coinAmount: 10,
  fiat: 'USD',
  fiatAmount: 100,
  orderType: 'buy',
  provider: 'yoroi',
  status: 'success',
}

const transferRequestAdaParams: LinksTransferRequestAdaParams = {
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
const transferRequestAdaResult: LinksTransferRequestAdaParams = {
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

const transferRequestAdaWithLinkParams: LinksTransferRequestAdaWithLinkParams =
  {
    link: 'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
  }
const transferRequestAdaWithLinkResult: LinksTransferRequestAdaWithLinkParams =
  {
    link: encodeURIComponent(
      'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
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
  },
  true,
)
