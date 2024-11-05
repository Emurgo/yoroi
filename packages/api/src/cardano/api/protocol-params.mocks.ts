import {Chain} from '@yoroi/types'

export const protocolParamsMockResponse: Chain.Cardano.ProtocolParams = {
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
}
