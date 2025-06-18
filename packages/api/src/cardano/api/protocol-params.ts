import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

import {z} from 'zod'

export const getProtocolParams =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<Api.Cardano.ProtocolParams> => {
    return request<Api.Cardano.ProtocolParams>({
      url: `${baseUrl}/protocolparameters`,
      data: undefined,
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then((response: Api.Cardano.ProtocolParams) => {
      const parsedResponse = parseProtocolParamsResponse(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid protocol params response'))
      return Promise.resolve(parsedResponse)
    })
  }

export const parseProtocolParamsResponse = (
  data: Api.Cardano.ProtocolParams,
): Api.Cardano.ProtocolParams | undefined => {
  return isProtocolParamsResponse(data) ? data : undefined
}

const RatioSchema = z.object({
  numerator: z.string(),
  denominator: z.string(),
})

const ProtocolParamsSchema = z.object({
  linearFee: z.object({
    constant: z.string(),
    coefficient: z.string(),
  }),
  minFeeReferenceScript: z.object({
    coinsPerByte: RatioSchema,
    tierStepBytes: z.string(),
    multiplier: z.string(),
  }),
  coinsPerUtxoByte: z.string(),
  poolDeposit: z.string(),
  keyDeposit: z.string(),
  epoch: z.number().nonnegative(),
  maxBlockBodySize: z.string(),
  maxBlockHeaderSize: z.string(),
  maxTxSize: z.string(),
  maxReferenceScriptsSize: z.string(),
  stakePoolPledgeInfluence: RatioSchema,
  monetaryExpansion: RatioSchema,
  treasuryExpansion: RatioSchema,
  minPoolCost: z.string(),
  maxExecutionUnits: z.object({
    perTransaction: z.object({
      memory: z.string(),
      cpu: z.string(),
    }),
    perBlock: z.object({
      memory: z.string(),
      cpu: z.string(),
    }),
  }),
  scriptExecutionPrices: z.object({
    memory: RatioSchema,
    cpu: RatioSchema,
  }),
  maxCollateralInputs: z.string(),
  collateralPercentage: z.string(),
  maxValueSize: z.string(),
  version: z.object({
    major: z.string(),
    minor: z.string(),
  }),
  governanceActionDeposit: z.string(),
  delegateRepresentativeDeposit: z.string(),
  constitutionalCommitteeMinSize: z.string(),
  constitutionalCommitteeMaxTermLength: z.string(),
  governanceActionLifetime: z.string(),
  delegateRepresentativeMaxIdleTime: z.string(),
  desiredNumberOfStakePools: z.string(),
  stakePoolRetirementEpochBound: z.string(),
  votingThresholds: z.object({
    stakePool: z.object({
      noConfidence: RatioSchema,
      committeeNormal: RatioSchema,
      committeeNoConfidence: RatioSchema,
      hardFork: RatioSchema,
      ppSecurity: RatioSchema,
    }),
    delegateRep: z.object({
      noConfidence: RatioSchema,
      committeeNormal: RatioSchema,
      committeeNoConfidence: RatioSchema,
      constitution: RatioSchema,
      hardFork: RatioSchema,
      ppNetwork: RatioSchema,
      ppEconomic: RatioSchema,
      ppTechnical: RatioSchema,
      ppGovernance: RatioSchema,
      treasury: RatioSchema,
    }),
  }),
})

export const isProtocolParamsResponse =
  createTypeGuardFromSchema(ProtocolParamsSchema)
