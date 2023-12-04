import {isRecord} from '@yoroi/common'
import {isString} from '@yoroi/common/src'

type Action =
  | {
      kind: 'abstain'
    }
  | {
      kind: 'no-confidence'
    }
  | {
      kind: 'delegate'
      drepID: string
    }

// TODO: Metadata structure to be confirmed https://github.com/cardano-foundation/CIPs/tree/master/CIP-1694
const metadataIndex = '1'
const abstainActionId = 1
const noConfidenceActionId = 2
const delegateActionId = 3

export const parseActionFromMetadata = (metadata: unknown): Action | null => {
  if (!isRecord(metadata)) return null
  const votingMetadata = metadata[metadataIndex]
  if (!isRecord(votingMetadata)) return null
  const actionId = votingMetadata.actionId

  switch (actionId) {
    case abstainActionId:
      return {kind: 'abstain'}
    case noConfidenceActionId:
      return {kind: 'no-confidence'}
    case delegateActionId:
      if (!isString(votingMetadata.drepID)) return null
      return {kind: 'delegate', drepID: votingMetadata.drepID}
    default:
      return null
  }
}
