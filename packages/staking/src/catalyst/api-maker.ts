import {FetchData, fetchData} from '@yoroi/common'
import {freeze} from 'immer'

import {Catalyst} from '../types'
import {catalystGetFundInfo} from './adapters/api'

const initialDeps = {request: fetchData} as const

export const catalystApiMaker = ({
  request,
}: {request: FetchData} = initialDeps): Catalyst.Api => {
  return freeze({
    getFundInfo: catalystGetFundInfo({request}),
  })
}
