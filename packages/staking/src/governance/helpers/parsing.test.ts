import {convertHexKeyHashToBech32Format, parseDrepId} from './parsing'
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

describe('parseDrepId', () => {
  const cardano = init('global')

  it('should parse a key hash in bech32 format', async () => {
    const result = await parseDrepId(
      'drep1jnmmkfwpta0yuwjchw0gu6csh75vy62088egy9n67d0zc7sn83m',
      cardano,
    )
    expect(result).toStrictEqual({
      hash: '94f7bb25c15f5e4e3a58bb9e8e6b10bfa8c2694f39f282167af35e2c',
      type: 'key',
    })
  })

  it('should parse a key hash in base32 format', async () => {
    const result = await parseDrepId(
      'drep1y2m0g4r66pyaw3p7u454wc0p4f0ygm8ueaev0mgd3tvwm7sskqwqp',
      cardano,
    )
    expect(result).toStrictEqual({
      hash: 'b6f4547ad049d7443ee5695761e1aa5e446cfccf72c7ed0d8ad8edfa',
      type: 'key',
    })
  })

  it('should parse a key hash starting with 22 in hex format', async () => {
    const result = await parseDrepId(
      '22b6f4547ad049d7443ee5695761e1aa5e446cfccf72c7ed0d8ad8edfa',
      cardano,
    )
    expect(result).toStrictEqual({
      hash: 'b6f4547ad049d7443ee5695761e1aa5e446cfccf72c7ed0d8ad8edfa',
      type: 'key',
    })
  })

  it('should parse a drep_vkh1 key hash in bech32 format', async () => {
    const result = await parseDrepId(
      'drep_vkh1km69g7ksf8t5g0h9d9tkrcd2tezxelx0wtr76rv2mrkl549k89t',
      cardano,
    )

    expect(result).toStrictEqual({
      hash: 'b6f4547ad049d7443ee5695761e1aa5e446cfccf72c7ed0d8ad8edfa',
      type: 'key',
    })
  })

  it('should parse a script hash in bech32 format', async () => {
    const result = await parseDrepId(
      'drep_script18cgl8kdnjculhww4n3h0a3ahc85ahjcsg53u0f93jnz9c0339av',
      cardano,
    )
    expect(result).toStrictEqual({
      hash: '3e11f3d9b39639fbb9d59c6efec7b7c1e9dbcb104523c7a4b194c45c',
      type: 'script',
    })
  })

  it('should parse a script hash starting with 23 in hex format', async () => {
    const result = await parseDrepId(
      '233e11f3d9b39639fbb9d59c6efec7b7c1e9dbcb104523c7a4b194c45c',
      cardano,
    )
    expect(result).toStrictEqual({
      hash: '3e11f3d9b39639fbb9d59c6efec7b7c1e9dbcb104523c7a4b194c45c',
      type: 'script',
    })
  })
})
