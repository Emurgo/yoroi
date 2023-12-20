import {convertHexKeyHashToBech32Format} from './parsing'
import {init} from '@emurgo/cross-csl-nodejs'

describe('convertHexKeyHashToBech32Format', () => {
  const cardano = init('global')

  it('should convert a hex key hash to a bech32 format', async () => {
    expect(
      await convertHexKeyHashToBech32Format(
        '1fa3dbd5dd88817729219888492bf3276827492bb76c84d9e5a923bb',
        cardano,
      ),
    ).toBe('drep1r73ah4wa3zqhw2fpnzyyj2lnya5zwjftkakgfk094y3mkerc53c')
  })
})
