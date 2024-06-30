import {FetchData, isRight} from '@yoroi/common'
import {freeze} from 'immer'
import {Api} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'

import {Catalyst} from '../../types'
import {toFundInfo} from '../transformers'
import {parseFundInfo} from '../validators'
import {catalystConfig} from '../config'

export function catalystGetFundInfo({request}: {request: FetchData}) {
  return async (
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<Readonly<Api.Response<Catalyst.FundInfo>>> => {
    const response = await request<Catalyst.CatalystApiFundInfo>(
      {url: catalystConfig.api.fund},
      fetcherConfig,
    )

    if (isRight(response)) {
      const candidate = toFundInfo(response.value.data)
      const parsed: Catalyst.FundInfo | undefined = parseFundInfo(candidate)

      if (!parsed) {
        return freeze(
          {
            tag: 'left',
            error: {
              status: -3,
              message: 'Failed to transform fund info response',
              responseData: response.value.data,
            },
          },
          true,
        )
      }

      return freeze(
        {
          tag: 'right',
          value: {
            status: response.value.status,
            data: parsed,
          },
        },
        true,
      )
    }

    return freeze(response, true)
  }
}
