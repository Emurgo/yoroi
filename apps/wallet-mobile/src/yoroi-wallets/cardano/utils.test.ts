import {SendToken} from '@emurgo/yoroi-lib'
import {Balance} from '@yoroi/types'

import {Token} from '../types'
import {PRIMARY_TOKEN} from './constants/mainnet/constants'
import {toSendToken, toSendTokenList} from './utils'

describe('toSendTokenList', () => {
  const asSendToken = toSendToken(PRIMARY_TOKEN)

  it('converts amounts to send token list for tx (lib)', async () => {
    const amounts: Balance.Amounts = {
      [PRIMARY_TOKEN.identifier]: '123',
      [secondaryToken.identifier]: '456',
    }

    const primaryAsToken = asSendToken({tokenId: PRIMARY_TOKEN.identifier, quantity: '123'})
    const secondaryAsToken = asSendToken({tokenId: secondaryToken.identifier, quantity: '456'})

    const sendTokenList: Array<SendToken> = [primaryAsToken, secondaryAsToken]

    expect(toSendTokenList(amounts, PRIMARY_TOKEN)).toEqual(sendTokenList)
  })
})

const secondaryToken: Token = {
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
