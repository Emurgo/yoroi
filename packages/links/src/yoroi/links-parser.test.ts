import {linksYoroiParser} from './links-parser'
import {linksYoroiModuleMaker} from './module'

describe('linksYoroiParser', () => {
  it('should parse transfer request ada', () => {
    const links = linksYoroiModuleMaker('https')
    const requestAdaLink = links.transfer.request.ada({
      targets: [
        {
          receiver: 'exampleReceiver1',
          datum: 'DEADDEAD',
          amounts: [
            {
              tokenId: 'exampleTokenId.name1',
              quantity: '10',
            },
          ],
        },
        {
          receiver: 'exampleReceiver2',
          amounts: [
            {
              tokenId: 'exampleTokenId.name2',
              quantity: '20',
            },
          ],
        },
      ],
      memo: 'exampleMemo',
      authorization: 'uuid-v4',
    })
    const result = linksYoroiParser(requestAdaLink)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/ada',
      params: {
        targets: [
          {
            receiver: 'exampleReceiver1',
            datum: 'DEADDEAD',
            amounts: [
              {
                tokenId: 'exampleTokenId.name1',
                quantity: '10',
              },
            ],
          },
          {
            receiver: 'exampleReceiver2',
            amounts: [
              {
                tokenId: 'exampleTokenId.name2',
                quantity: '20',
              },
            ],
          },
        ],
        memo: 'exampleMemo',
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse transfer request ada with link', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%252Bcardano%253Aaddr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh%253Famount%253D10&authorization=uuid-v4'

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/ada-with-link',
      params: {
        link: 'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse exchange show create result link', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi&coinAmount=10&coin=ADA&fiatAmount=100&fiat=USD&status=success&orderType=buy'

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'exchange',
      useCase: 'order/show-create-result',
      params: {
        provider: 'yoroi',
        coinAmount: 10,
        coin: 'ADA',
        fiatAmount: 100,
        fiat: 'USD',
        status: 'success',
        orderType: 'buy',
      },
    })
  })

  it('should return null for invalid link', () => {
    const link = 'invalid-link'

    const result = linksYoroiParser(link)

    expect(result).toBeNull()
  })
})
