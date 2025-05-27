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
  utxo: '7672f4df735270fb308ec354223f184099d1dde55b769b2c1faf70d6057a6296#2',
  characters: 'letters',
  numeric_modifiers: '',
  default_in_wallet: 'stackchain',
  pfp_image: '',
  bg_image: '',
  resolved_addresses: {
    ada: 'addr1qypuftxvdyhfc5rmmt74u77sfagfwwgn8xpm98aqnm3esuxssydveuc8xyx4zh27fwcmr62mraeezjwf24hzkyejwfmq9xxnr5',
  },
  created_slot_number: 68419174,
  updated_slot_number: 150303886,
  has_datum: false,
  image_hash: '',
  standard_image_hash: '',
  svg_version: '',
  version: 0,
  handle_type: 'handle',
  payment_key_hash: '03c4accc692e9c507bdafd5e7bd04f509739133983b29fa09ee39870',
  pz_enabled: true,
  policy: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
} as const

export const handleApiMockResponses = {
  getCrypoAddress,
} as const
