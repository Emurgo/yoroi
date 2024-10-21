import {freeze} from 'immer'
import {Catalyst} from '../types'

export function toFundInfo(
  fundInfo: Readonly<Catalyst.CatalystApiFundInfo>,
): Readonly<Catalyst.FundInfo> {
  return freeze(
    {
      id: fundInfo.id,
      fundName: fundInfo.fund_name,
      fundStartTime: new Date(fundInfo.fund_start_time),
      fundEndTime: new Date(fundInfo.fund_end_time),
      registrationSnapshotTime: new Date(fundInfo.registration_snapshot_time),
      snapshotStart: new Date(fundInfo.snapshot_start),
      votingStart: new Date(fundInfo.voting_start),
      votingEnd: new Date(fundInfo.voting_end),
      tallyingEnd: new Date(fundInfo.tallying_end),
      resultsUrl: fundInfo.results_url,
      surveyUrl: fundInfo.survey_url,
      votingPowerThreshold: fundInfo.voting_power_threshold,

      challenges: fundInfo.challenges?.map((challenge) => ({
        id: challenge.id,
        challengeType: challenge.challenge_type,
        title: challenge.title,
        description: challenge.description,
        rewardsTotal: challenge.rewards_total,
        proposersRewards: challenge.proposers_rewards,
        challengeUrl: challenge.challenge_url,
      })),
    },
    true,
  )
}
