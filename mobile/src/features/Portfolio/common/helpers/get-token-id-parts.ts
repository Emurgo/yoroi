import {Portfolio} from '@yoroi/types'

export function getTokenIdParts(tokenId: Portfolio.Token.Id) {
  const [policyId, assetName] = tokenId.split('.')
  return {policyId, assetName} as const
}
