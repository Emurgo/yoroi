import {configCardanoLegacyTransfer} from '../cardano/constants'
import {linksCardanoModuleMaker} from '../cardano/module'
import {linksYoroiModuleMaker} from './module'
import {
  LinksExchangeShowCreateResultParams,
  LinksTransferRequestAdaParams,
  LinksTransferRequestAdaWithLinkParams,
} from './types'

describe('linksYoroiModuleMaker', () => {
  it('should create exchange links', () => {
    const {exchange} = linksYoroiModuleMaker('yoroi')

    const createOrderShowResultParams: LinksExchangeShowCreateResultParams = {
      provider: 'yoroi',
      coinAmount: 10,
      coin: 'ADA',
      fiatAmount: 100,
      fiat: 'USD',
      status: 'success',
      orderType: 'buy',
    }

    const createOrderShowResultLink = exchange.order.showCreateResult(
      createOrderShowResultParams,
    )

    const expected =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi&coinAmount=10&coin=ADA&fiatAmount=100&fiat=USD&status=success&orderType=buy'

    expect(createOrderShowResultLink).toEqual(expected)
  })

  it('should create transfer with links', () => {
    const {transfer} = linksYoroiModuleMaker('yoroi')

    const transferRequestAdaParams: LinksTransferRequestAdaParams = {
      targets: [
        {
          receiver: 'exampleReceiver',
          datum: 'DEADDEAD',
          amounts: [
            {
              tokenId: 'exampleTokenId',
              quantity: '10',
            },
          ],
        },
        {
          receiver: 'exampleReceiver2',
          amounts: [
            {
              tokenId: 'exampleTokenId2',
              quantity: '20',
            },
          ],
        },
      ],
      memo: 'exampleMemo',
      authorization: 'uuid-v4',
    }

    const transferRequestAdaLink = transfer.request.ada(
      transferRequestAdaParams,
    )
    const expectedTransferRequestAdaLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada?targets%5B0%5D=%7B%22receiver%22%3A%22exampleReceiver%22%2C%22datum%22%3A%22DEADDEAD%22%2C%22amounts%22%3A%5B%7B%22tokenId%22%3A%22exampleTokenId%22%2C%22quantity%22%3A%2210%22%7D%5D%7D&targets%5B1%5D=%7B%22receiver%22%3A%22exampleReceiver2%22%2C%22amounts%22%3A%5B%7B%22tokenId%22%3A%22exampleTokenId2%22%2C%22quantity%22%3A%2220%22%7D%5D%7D&memo=exampleMemo&authorization=uuid-v4'
    expect(transferRequestAdaLink).toEqual(expectedTransferRequestAdaLink)

    const wrongAdaLink: LinksTransferRequestAdaWithLinkParams = {
      link: 'exampleLink',
      authorization: 'uuid-v4',
    }
    expect(() => transfer.request.adaWithLink(wrongAdaLink)).toThrow()

    const correctAdaLink = linksCardanoModuleMaker().create({
      config: configCardanoLegacyTransfer,
      params: {
        address:
          'addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh',
        amount: 10,
      },
    })

    const requestAdaWithLinkParams: LinksTransferRequestAdaWithLinkParams = {
      link: correctAdaLink.link,
      authorization: 'uuid-v4',
    }
    const requestAdaWithLinkLink = transfer.request.adaWithLink(
      requestAdaWithLinkParams,
    )
    const expectedRequestAdaWithLinkLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=7765622b63617264616e6f3a61646472317179676e70676e6d6334747771786534716e6a3370616b75646330797368657177666c7638677577776c706c79377a70746733776a717a38346b783374347265347870717673336675376d7673616877687978643471337171393073377367786e683f616d6f756e743d3130&authorization=uuid-v4'

    expect(requestAdaWithLinkLink).toEqual(expectedRequestAdaWithLinkLink)

    const requestAdaWithLinkParamsOnlyLink: LinksTransferRequestAdaWithLinkParams =
      {
        link: correctAdaLink.link,
      }
    const requestAdaWithLinkOnlyLink = transfer.request.adaWithLink(
      requestAdaWithLinkParamsOnlyLink,
    )
    const expectedRequestAdaWithLinkOnlyLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=7765622b63617264616e6f3a61646472317179676e70676e6d6334747771786534716e6a3370616b75646330797368657177666c7638677577776c706c79377a70746733776a717a38346b783374347265347870717673336675376d7673616877687978643471337171393073377367786e683f616d6f756e743d3130'

    expect(requestAdaWithLinkOnlyLink).toEqual(
      expectedRequestAdaWithLinkOnlyLink,
    )
  })
})
