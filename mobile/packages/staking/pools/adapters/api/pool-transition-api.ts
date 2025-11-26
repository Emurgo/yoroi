import {FetchData, isRight} from '@yoroi/common'
import {Api} from '@yoroi/types'

import {freeze} from 'immer'

import {TransitionData} from '../../pool-info-api'

export function poolTransitionGetInfo({
  request,
  baseApiUrl,
}: {
  request: FetchData
  baseApiUrl: string
}) {
  return async (): Promise<Readonly<Api.Response<TransitionData | null>>> => {
    const response = await request<TransitionData>({
      url: `${baseApiUrl}/v2.1/pools/poolTransitionInfo`,
      method: 'get',
    })

    if (isRight(response)) {
      return freeze(
        {
          tag: 'right',
          value: {
            status: response.value.status,
            data: response.value.data,
          },
        },
        true,
      )
    }

    // Return null on error (matches current behavior)
    return freeze(
      {
        tag: 'right',
        value: {
          status: 200,
          data: null,
        },
      },
      true,
    )
  }
}
