import {freeze} from 'immer'

export const cardanoConfig = freeze(
  {
    denominations: {
      ada: 1_000_000n,
    },
    params: {
      minUtxoValue: 1_000_000n,
    },
    derivation: {
      hardStart: 2_147_483_648,
      keyLevel: {
        root: 0,
        purpose: 1,
        coinType: 2,
        account: 3,
        role: 4,
        index: 5,
      },
    },
    implementations: {
      'cardano-cip1852': {
        features: {
          staking: {
            derivation: {
              role: 2,
              index: 0,
            },
            addressing: [2_147_485_500, 2_147_485_463, 2_147_483_648, 2, 0],
          },
        },
        derivations: {
          gapLimit: 20,
          base: {
            roles: {
              external: 0,
              internal: 1,
              staking: 2,
              drep: 3,
              comitteeCold: 4,
              comitteeHot: 5,
            },
            harden: {
              purpose: 2_147_485_500,
              coinType: 2_147_485_463,
            },
            visual: {
              purpose: 1852,
              coinType: 1815,
            },
          },
        },
      },
      'cardano-bip44': {
        features: {
          staking: false,
        },
        derivations: {
          gapLimit: 20,
          base: {
            roles: {
              external: 0,
              internal: 1,
              drep: 3,
            },
            harden: {
              purpose: 2_147_483_692,
              coinType: 2_147_485_463,
            },
            visual: {
              purpose: 44,
              coinType: 1815,
            },
          },
        },
      },
    },
  } as const,
  true,
)
