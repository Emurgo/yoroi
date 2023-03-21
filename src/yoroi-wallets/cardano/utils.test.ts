import {SendTokenList, Token, YoroiAmounts} from '../types'
import {PRIMARY_TOKEN} from './shelley/constants'
import {toSendTokenList} from './utils'

describe('makeSendTokenList', () => {
  it('converts target to send amount token list', async () => {
    const amounts: YoroiAmounts = {
      [PRIMARY_TOKEN.identifier]: '123',
      [token.identifier]: '456',
    }

    const sendTokenList: SendTokenList = [
      {
        token: PRIMARY_TOKEN,
        amount: '123',
      },
      {
        token: {
          ...token,
          metadata: {},
        } as unknown as Token, // metadata is not used when creating a transaction
        amount: '456',
      },
    ]

    expect(toSendTokenList(amounts, PRIMARY_TOKEN)).toEqual(sendTokenList)
  })
})

const token: Token = {
  identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
  networkId: 1,
  isDefault: false,
  metadata: {
    type: 'Cardano',
    policyId: '2',
    assetName: '2',
    ticker: '2',
    numberOfDecimals: 0,
    longName: null,
    maxSupply: null,
  },
}
