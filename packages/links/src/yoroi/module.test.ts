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
      authorization: 'ac0692d3-bf34-44e2-b57d-53e4ce47666b',
      message: 'hi there',
      walletId: 'c4832ba5-c03e-4bd8-93ee-52536f1b1747',
      appId: 'yoroi',
      isSandbox: true,
      isTestnet: false,
      redirectTo: 'https://yoroi-wallet.com',
      signature:
        '4B7C8DB8B485D176D426980EE8A0D8A600B305AE2D7DC835B537657E2DAE110A6F7C0A641EAA623A8C43568BFC9DDCED5CBEA5AD6768BDE89F084EEDDBEBA36A',
    }
    const requestAdaWithLinkLink = transfer.request.adaWithLink(
      requestAdaWithLinkParams,
    )
    const expectedRequestAdaWithLinkLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%252Bcardano%253Aaddr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh%253Famount%253D10&isSandbox=true&isTestnet=false&appId=yoroi&message=hi+there&walletId=c4832ba5-c03e-4bd8-93ee-52536f1b1747&authorization=ac0692d3-bf34-44e2-b57d-53e4ce47666b&signature=4B7C8DB8B485D176D426980EE8A0D8A600B305AE2D7DC835B537657E2DAE110A6F7C0A641EAA623A8C43568BFC9DDCED5CBEA5AD6768BDE89F084EEDDBEBA36A&redirectTo=https%253A%252F%252Fyoroi-wallet.com'

    expect(requestAdaWithLinkLink).toEqual(expectedRequestAdaWithLinkLink)

    const requestAdaWithLinkParamsOnlyLink: LinksTransferRequestAdaWithLinkParams =
      {
        link: correctAdaLink.link,
      }
    const requestAdaWithLinkOnlyLink = transfer.request.adaWithLink(
      requestAdaWithLinkParamsOnlyLink,
    )
    const expectedRequestAdaWithLinkOnlyLink =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%252Bcardano%253Aaddr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh%253Famount%253D10'

    expect(requestAdaWithLinkOnlyLink).toEqual(
      expectedRequestAdaWithLinkOnlyLink,
    )
  })
})
