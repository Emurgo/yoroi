import {configCardanoLegacyTransfer} from '../cardano/constants'
import {linksCardanoModuleMaker} from '../cardano/module'
import {linksYoroiModuleMaker} from './module'
import {
  LinksYoroiExchangeShowCreateResultParams,
  LinksYoroiTransferRequestAdaParams,
  LinksYoroiTransferRequestAdaWithUrlParams,
} from './types'

describe('linksYoroiModuleMaker', () => {
  it('should create exchange links', () => {
    const {exchange} = linksYoroiModuleMaker('yoroi')

    const createOrderShowResultParams: LinksYoroiExchangeShowCreateResultParams =
      {
        provider: 'yoroi',
        coinAmount: 10,
        coin: 'ADA',
        fiatAmount: 100,
        fiat: 'USD',
        status: 'success',
      }

    const createOrderShowResultLink = exchange.order.showCreateResult(
      createOrderShowResultParams,
    )

    const expected =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi&coinAmount=10&coin=ADA&fiatAmount=100&fiat=USD&status=success'

    expect(createOrderShowResultLink).toEqual(expected)
  })

  it('should create transfer links', () => {
    const {transfer} = linksYoroiModuleMaker('yoroi')

    const transferRequestAdaParams: LinksYoroiTransferRequestAdaParams = {
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
      ],
      memo: 'exampleMemo',
      authorization: 'uuid-v4',
    }

    const transferRequestAdaLink = transfer.request.ada(
      transferRequestAdaParams,
    )
    const expectedTransferRequestAdaLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada?targets=%7B%22receiver%22%3A%22exampleReceiver%22%2C%22datum%22%3A%22DEADDEAD%22%2C%22amounts%22%3A%5B%7B%22tokenId%22%3A%22exampleTokenId%22%2C%22quantity%22%3A%2210%22%7D%5D%7D&memo=exampleMemo&authorization=uuid-v4'
    expect(transferRequestAdaLink).toEqual(expectedTransferRequestAdaLink)

    const wrongAdaLink: LinksYoroiTransferRequestAdaWithUrlParams = {
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

    const requestAdaWithLinkParams: LinksYoroiTransferRequestAdaWithUrlParams =
      {
        link: correctAdaLink.link,
        authorization: 'uuid-v4',
      }
    const requestAdaWithLinkLink = transfer.request.adaWithLink(
      requestAdaWithLinkParams,
    )
    const expectedRequestAdaWithLinkLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%2Bcardano%3Aaddr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh%3Famount%3D10&authorization=uuid-v4'

    expect(requestAdaWithLinkLink).toEqual(expectedRequestAdaWithLinkLink)
  })
})
