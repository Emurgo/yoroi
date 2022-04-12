import {generateShelleyPlateFromMnemonics} from './plate'

const mnemonic = [
  'dry balcony arctic what garbage sort',
  'cart shine egg lamp manual bottom',
  'slide assault bus',
].join(' ')

const expectedPlate = {
  addresses: [
    'addr1qynqc23tpx4dqps6xgqy9s2l3xz5fxu734wwmzj9uddn0h2z6epfcukqmswgwwfruxh7gaddv9x0d5awccwahnhwleqqc4zkh4',
  ],
  accountPlate: {
    ImagePart:
      '33166efaf23401b284eadb3b7d353d6c0d666369e8424d88ec1d00c6188777412412232d9b5f64353c03eac83bec4be0dba9877bce27d7bd7e00788bbdc3e61f',
    TextPart: 'NNPB-3784',
  },
}

test('Shelley plate', async () => {
  const plate = await generateShelleyPlateFromMnemonics(
    mnemonic,
    1,
    1, // haskell shelley
  )
  expect(plate).toStrictEqual(expectedPlate)
})
