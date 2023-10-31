import {getRegion} from './getRegion'

describe('getRegion', () => {
  it.each`
    input      | expected
    ${'en-US'} | ${'US'}
    ${'pt-BR'} | ${'BR'}
    ${'pt-PT'} | ${'PT'}
    ${'es-ES'} | ${'ES'}
    ${'fr-FR'} | ${'FR'}
    ${'de-DE'} | ${'DE'}
    ${'it-IT'} | ${'IT'}
    ${'ru-RU'} | ${'RU'}
    ${'zh-CN'} | ${'CN'}
    ${'ja-JP'} | ${'JP'}
    ${'ko-KR'} | ${'KR'}
    ${'ar-SA'} | ${'SA'}
    ${'he-IL'} | ${'IL'}
    ${'tr-TR'} | ${'TR'}
    ${'nl-NL'} | ${'NL'}
    ${'da-DK'} | ${'DK'}
    ${'fi-FI'} | ${'FI'}
    ${'no-NO'} | ${'NO'}
    ${'sv-SE'} | ${'SE'}
    ${'pl-PL'} | ${'PL'}
    ${'hu-HU'} | ${'HU'}
    ${'el-GR'} | ${'GR'}
    ${'po'}    | ${'US'}
  `(`extract the region $expected from the $input or fallback to US`, ({input, expected}) => {
    expect(getRegion(input)).toBe(expected)
  })
})
