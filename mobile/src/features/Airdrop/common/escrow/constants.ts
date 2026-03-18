export const ESCROW_SCRIPT_HASH =
  '5986bfcc0cbfc60dec8df87715cc95d03817aac386b0e9d33da03b39'
export const ESCROW_SCRIPT_SIZE = 6278
export const NIGHT_POLICY_ID =
  '0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa'
export const NIGHT_ASSET_NAME_HEX = '4e49474854'
export const TREASURY_ADDRESS =
  'addr1wxgp2xvmvh0lrfdeu2q3jtqp2lprej6hjvgjx2u5lcwqxlqfvty7h'

export const KNOWN_REFERENCE_SCRIPT_UTXOS = [
  {
    txHash: 'da17a0e51e8374fafa9977c5bddf4bc35af2eb53bda52dfc8b38c451e7e150f1',
    txIndex: 0,
  },
  {
    txHash: '80a146507156745632e5e4b7ae72944fd67a9cc57cb850e826c30151e825be56',
    txIndex: 0,
  },
]

// Shelley mainnet slot config for time <-> slot conversion
export const SHELLEY_SLOT_CONFIG = {
  zeroTime: 1591566291, // unix seconds at slot 4924800
  zeroSlot: 4924800,
}
