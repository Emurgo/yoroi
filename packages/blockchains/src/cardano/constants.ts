import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain, Network} from '@yoroi/types'
import {freeze} from 'immer'

export const primaryTokenInfoMainnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
})

export const primaryTokenInfoAnyTestnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'TADA',
  ticker: 'TADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
})

// NOTE: what is called ERA config, is actually grouping up the slot configs
export const shelleyEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2020-07-29T21:44:51.000Z'),
    end: new Date('2029-06-01T01:00:00.000Z'),
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const byronEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'byron',
    start: new Date('2017-09-23T21:44:51.000Z'),
    end: new Date('2020-07-29T21:44:51.000Z'),
    slotInSeconds: 20,
    slotsPerEpoch: 21600,
  },
  true,
)

export const shelleyPreprodEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2022-06-01T01:00:00.000Z'),
    end: new Date('2029-06-01T01:00:00.000Z'),
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const protocolParamsPlaceholder: Chain.Cardano.ProtocolParams = freeze({
  linearFee: {
    constant: '155381',
    coefficient: '44',
  },
  minFeeReferenceScript: {
    coinsPerByte: {
      numerator: '15',
      denominator: '1',
    },
    tierStepBytes: '25600',
    multiplier: '1.2',
  },
  coinsPerUtxoByte: '4310',
  poolDeposit: '500000000',
  keyDeposit: '2000000',
  epoch: 67,
  maxBlockBodySize: '90112',
  maxBlockHeaderSize: '1100',
  maxTxSize: '16384',
  maxReferenceScriptsSize: '204800',
  stakePoolPledgeInfluence: {
    numerator: '3',
    denominator: '10',
  },
  monetaryExpansion: {
    numerator: '3',
    denominator: '1000',
  },
  treasuryExpansion: {
    numerator: '1',
    denominator: '5',
  },
  minPoolCost: '340000000',
  maxExecutionUnits: {
    perTransaction: {
      memory: '14000000',
      cpu: '10000000000',
    },
    perBlock: {
      memory: '62000000',
      cpu: '20000000000',
    },
  },
  scriptExecutionPrices: {
    memory: {
      numerator: '577',
      denominator: '10000',
    },
    cpu: {
      numerator: '721',
      denominator: '10000000',
    },
  },
  maxCollateralInputs: '3',
  collateralPercentage: '150',
  maxValueSize: '5000',
  version: {
    major: '8',
    minor: '0',
  },
  governanceActionDeposit: '100000000000',
  delegateRepresentativeDeposit: '500000000',
  constitutionalCommitteeMinSize: '7',
  constitutionalCommitteeMaxTermLength: '146',
  governanceActionLifetime: '6',
  delegateRepresentativeMaxIdleTime: '20',
  desiredNumberOfStakePools: '500',
  stakePoolRetirementEpochBound: '18',
  votingThresholds: {
    stakePool: {
      noConfidence: {
        numerator: '51',
        denominator: '100',
      },
      committeeNormal: {
        numerator: '51',
        denominator: '100',
      },
      committeeNoConfidence: {
        numerator: '51',
        denominator: '100',
      },
      hardFork: {
        numerator: '51',
        denominator: '100',
      },
      ppSecurity: {
        numerator: '51',
        denominator: '100',
      },
    },
    delegateRep: {
      noConfidence: {
        numerator: '67',
        denominator: '100',
      },
      committeeNormal: {
        numerator: '67',
        denominator: '100',
      },
      committeeNoConfidence: {
        numerator: '3',
        denominator: '5',
      },
      constitution: {
        numerator: '3',
        denominator: '5',
      },
      hardFork: {
        numerator: '3',
        denominator: '5',
      },
      ppNetwork: {
        numerator: '67',
        denominator: '100',
      },
      ppEconomic: {
        numerator: '67',
        denominator: '100',
      },
      ppTechnical: {
        numerator: '67',
        denominator: '100',
      },
      ppGovernance: {
        numerator: '3',
        denominator: '4',
      },
      treasury: {
        numerator: '67',
        denominator: '100',
      },
    },
  },
})

export const cardanoConfig = freeze(
  {
    denominations: {
      lovelace: 1,
      ada: 1_000_000n,
    },
    // NOTE: UI value, it is an approximation
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
