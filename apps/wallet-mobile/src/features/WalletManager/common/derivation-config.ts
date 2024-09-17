import {freeze} from 'immer'

// https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
export const derivationConfig = freeze(
  {
    gapLimit: 20,
    hardStart: 2_147_483_648,
    keyLevel: {
      root: 0,
      purpose: 1,
      coinType: 2,
      account: 3,
      role: 4,
      index: 5,
    },
  } as const,
  true,
)
