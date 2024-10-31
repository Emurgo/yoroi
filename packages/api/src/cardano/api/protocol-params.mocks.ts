import {Chain} from '@yoroi/types'

export const protocolParamsMockResponse: Chain.Cardano.ProtocolParams = {
  linearFee: {
    constant: '155381',
    coefficient: '44',
  },
  minFeeReferenceScript: {
    coinsPerByte: {
      numerator: '0',
      denominator: '1',
    },
    tierStepBytes: '0',
    multiplier: '0',
  },
  coinsPerUtxoByte: '4310',
  poolDeposit: '500000000',
  keyDeposit: '2000000',
  epoch: 67,
  maxBlockBodySize: '90112',
  maxBlockHeaderSize: '1100',
  maxTxSize: '16384',
  maxReferenceScriptsSize: '0',
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
  governanceActionDeposit: '0',
  delegateRepresentativeDeposit: '0',
  constitutionalCommitteeMinSize: '0',
  constitutionalCommitteeMaxTermLength: '0',
  governanceActionLifetime: '0',
  delegateRepresentativeMaxIdleTime: '0',
  desiredNumberOfStakePools: '500',
  stakePoolRetirementEpochBound: '18',
  votingThresholds: {
    stakePool: {
      noConfidence: {
        numerator: '0',
        denominator: '1',
      },
      committeeNormal: {
        numerator: '0',
        denominator: '1',
      },
      committeeNoConfidence: {
        numerator: '0',
        denominator: '1',
      },
      hardFork: {
        numerator: '0',
        denominator: '1',
      },
      ppSecurity: {
        numerator: '0',
        denominator: '1',
      },
    },
    delegateRep: {
      noConfidence: {
        numerator: '0',
        denominator: '1',
      },
      committeeNormal: {
        numerator: '0',
        denominator: '1',
      },
      committeeNoConfidence: {
        numerator: '0',
        denominator: '1',
      },
      constitution: {
        numerator: '0',
        denominator: '1',
      },
      hardFork: {
        numerator: '0',
        denominator: '1',
      },
      ppNetwork: {
        numerator: '0',
        denominator: '1',
      },
      ppEconomic: {
        numerator: '0',
        denominator: '1',
      },
      ppTechnical: {
        numerator: '0',
        denominator: '1',
      },
      ppGovernance: {
        numerator: '0',
        denominator: '1',
      },
      treasury: {
        numerator: '0',
        denominator: '1',
      },
    },
  },
}
