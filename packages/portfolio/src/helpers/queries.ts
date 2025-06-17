import {Portfolio} from '@yoroi/types'
import {isRight} from '@yoroi/common'

import {isPrimaryToken} from './is-primary-token'
import {createUnknownTokenInfo} from './create-unknown-token-info'

export const queryTokenInfo = async ({
  id,
  getTokenInfo,
  primaryTokenInfo,
}: {
  id: Portfolio.Token.Id
  getTokenInfo: Portfolio.Api.Api['tokenInfo']
  primaryTokenInfo: Portfolio.Token.Info
}) => {
  if (isPrimaryToken(id)) return primaryTokenInfo
  const response = await getTokenInfo(id)
  if (isRight(response)) return response.value.data
  const [, assetName] = id.split('.')
  return createUnknownTokenInfo({id, name: assetName!})
}
