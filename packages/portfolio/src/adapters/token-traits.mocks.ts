import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

const nftCryptoKitty: Portfolio.Token.Traits = {
  totalItems: 1,
  traits: [
    {type: 'rarity', value: 'common', rarity: 'common'},
    {type: 'color', value: 'blue', rarity: 'common'},
  ],
}

const rnftWhatever: Portfolio.Token.Traits = {
  totalItems: 1,
  traits: [
    {type: 'rarity', value: 'rare', rarity: 'rare'},
    {type: 'color', value: 'red', rarity: 'rare'},
  ],
}

export const tokenTraitsMocks = freeze({
  nftCryptoKitty,
  rnftWhatever,
})
