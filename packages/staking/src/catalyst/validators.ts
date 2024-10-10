import {z} from 'zod'
import {Catalyst} from '../types'
import {createTypeGuardFromSchema} from '@yoroi/common'

const FundChallengeSchema = z.object({
  id: z.number(),
  challengeType: z.string(),
  title: z.string(),
  description: z.string(),
  rewardsTotal: z.number(),
  proposersRewards: z.number(),
  challengeUrl: z.string().url(),
})

export const FundInfoSchema = z.object({
  id: z.number(),
  fundName: z.string(),
  fundStartTime: z.date(),
  fundEndTime: z.date(),
  registrationSnapshotTime: z.date(),
  challenges: z.array(FundChallengeSchema),
  snapshotStart: z.date(),
  votingStart: z.date(),
  votingEnd: z.date(),
  tallyingEnd: z.date(),
  resultsUrl: z.string(),
  surveyUrl: z.string(),
})

export const isFundInfo =
  createTypeGuardFromSchema<Catalyst.FundInfo>(FundInfoSchema)

export function parseFundInfo(data: unknown): Catalyst.FundInfo | undefined {
  return isFundInfo(data) ? data : undefined
}
