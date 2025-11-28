import {primaryTokenInfoMainnet} from '@yoroi/blockchains'
import {createUnknownTokenInfo} from '@yoroi/portfolio'
import {SendToken} from '@yoroi/tx'
import {Balance, Portfolio} from '@yoroi/types'

import {toSendToken, toSendTokenList} from './utils'

describe('toSendTokenList', () => {
  const asSendToken = toSendToken(primaryTokenInfoMainnet)

  it('converts amounts to send token list for tx (lib)', async () => {
    const amounts: Balance.Amounts = {
      [primaryTokenInfoMainnet.id]: '123',
      [secondaryToken.id]: '456',
    }

    const primaryAsToken = asSendToken({
      tokenId: primaryTokenInfoMainnet.id,
      quantity: '123',
    })
    const secondaryAsToken = asSendToken({
      tokenId: secondaryToken.id,
      quantity: '456',
    })

    const sendTokenList: Array<SendToken> = [primaryAsToken, secondaryAsToken]

    expect(toSendTokenList(amounts, primaryTokenInfoMainnet)).toEqual(
      sendTokenList,
    )
  })
})

const secondaryToken = createUnknownTokenInfo({
  id: '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7.',
  name: 'Test Token',
}) as Portfolio.Token.Info
