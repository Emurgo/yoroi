import {SendToken} from '@emurgo/yoroi-lib'
import {Balance} from '@yoroi/types'

import {primaryTokenInfoMainnet} from '../../features/WalletManager/network-manager/network-manager'
import {Token} from '../types/tokens'
import {toSendToken, toSendTokenList} from './utils'

describe('toSendTokenList', () => {
  const asSendToken = toSendToken(primaryTokenInfoMainnet)

  it('converts amounts to send token list for tx (lib)', async () => {
    const amounts: Balance.Amounts = {
      [primaryTokenInfoMainnet.id]: '123',
      [secondaryToken.identifier]: '456',
    }

    const primaryAsToken = asSendToken({tokenId: primaryTokenInfoMainnet.id, quantity: '123'})
    const secondaryAsToken = asSendToken({tokenId: secondaryToken.identifier, quantity: '456'})

    const sendTokenList: Array<SendToken> = [primaryAsToken, secondaryAsToken]

    expect(toSendTokenList(amounts, primaryTokenInfoMainnet)).toEqual(sendTokenList)
  })
})

const secondaryToken: Token = {
  identifier: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7',
  isDefault: false,
  metadata: {
    policyId: '2',
    assetName: '2',
    ticker: '2',
    numberOfDecimals: 0,
    longName: null,
    maxSupply: null,
  },
}
