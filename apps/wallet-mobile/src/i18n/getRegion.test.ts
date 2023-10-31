import {getRegion} from './getRegion'

describe('getRegion', () => {
  it.each`
    input      | expected
    ${'en-US'} | ${'US'}
    ${'pt-BR'} | ${'BR'}
    ${'pt-PT'} | ${'US'}
    ${'es-ES'} | ${'ES'}
    ${'fr-FR'} | ${'FR'}
    ${'de-DE'} | ${'DE'}
    ${'it-IT'} | ${'IT'}
    ${'ru-RU'} | ${'RU'}
    ${'zh-CN'} | ${'US'}
    ${'ja-JP'} | ${'JP'}
    ${'po'}    | ${'US'}
  `(`extract the region $expected from the $input or fallback to US`, ({input, expected}) => {
    expect(getRegion(input)).toBe(expected)
  })
})
