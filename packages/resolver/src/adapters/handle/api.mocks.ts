import {HandleApiGetCryptoAddressResponse} from './api'

export const getCrypoAddress: HandleApiGetCryptoAddressResponse = {
  hex: '737461636b636861696e',
  name: 'stackchain',
  image: 'ipfs://QmdEu1i3WxjFjQeJNm7Nmkqg9EU9RThHhAnKd1jsjw7LdC',
  standard_image: 'ipfs://QmdEu1i3WxjFjQeJNm7Nmkqg9EU9RThHhAnKd1jsjw7LdC',
  holder: 'stake1u8ggzxkv7vrnzr23t40yhvd3a9d37uu3f8y42m3tzve8yasraq5q3',
  holder_type: 'wallet',
  length: 10,
  og_number: 0,
  rarity: 'basic',
  utxo: '5d3df979188b000e2829ec99fc58c9e5cee79dfe6fa4be13697bdd819ff3de77#5',
  characters: 'letters',
  numeric_modifiers: '',
  default_in_wallet: 'stackchain',
  pfp_image: '',
  bg_image: '',
  resolved_addresses: {
    ada: 'addr1q9tgylj36qjp94rr3yjr5vtku3sltaqpefhergrnvluhtm7ssydveuc8xyx4zh27fwcmr62mraeezjwf24hzkyejwfmq0x9kll',
  },
  created_slot_number: 68419174,
  updated_slot_number: 103477127,
  has_datum: false,
  svg_version: '',
  image_hash: '',
  standard_image_hash: '',
  version: 0,
} as const

export const handleApiMockResponses = {
  getCrypoAddress,
} as const
