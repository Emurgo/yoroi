import {freeze} from 'immer'

export const cardanoConfig = freeze(
  {
    denominations: {
      ada: 1_000_000n,
    },
    params: {
      minUtxoValue: 1_000_000n,
    },
    implementations: {
      // after shelley
      // https://cips.cardano.org/cip/CIP-1852
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
      // byron
      // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
      'cardano-bip44': {
        features: {
          staking: false,
        },
        derivations: {
          base: {
            roles: {
              external: 0,
              internal: 1,
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
