import {generateByronPlateFromMnemonics} from './plate'

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const expectedPlate = {
  addresses: ['Ae2tdPwUPEZKAx4zt8YLTGxrhX9L6R8QPWNeefZsPgwaigWab4mEw1ECUZ7'],
  accountPlate: {
    ImagePart:
      '61942e0a01bd7eccff636a468e4d04bd05fe2169c2d26f83236ade661860d93e22c07ff007117555c6a15a92ac43f88e453d31c3b7a240dcd11ca3a7eba29321',
    TextPart: 'SKBE-5478',
  },
}

test('Byron plate', async () => {
  const plate = await generateByronPlateFromMnemonics(mnemonic, 1)
  expect(plate).toStrictEqual(expectedPlate)
})
