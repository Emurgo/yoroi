import {freeze} from 'immer'

import {catalystConfig} from './config'
import {Catalyst} from '../types'

export const catalystManagerMaker = ({api}: {api: Catalyst.Api}) => {
  const getFundInfo = () => api.getFundInfo()

  return freeze({
    getFundInfo,
    fundStatus,
    config: catalystConfig,
  })
}

function fundStatus(
  {snapshotStart, votingStart, votingEnd, tallyingEnd}: Catalyst.FundInfo,
  when = new Date(),
): Readonly<Catalyst.FundStatus> {
  const registration =
    when < snapshotStart ? 'pending' : when < votingStart ? 'running' : 'done'
  const voting =
    when < votingStart
      ? 'pending'
      : when >= votingStart && when < votingEnd
      ? 'running'
      : 'done'
  const results =
    when < votingEnd
      ? 'pending'
      : when >= votingEnd && when < tallyingEnd
      ? 'running'
      : 'done'

  return freeze({registration, voting, results} as const)
}
