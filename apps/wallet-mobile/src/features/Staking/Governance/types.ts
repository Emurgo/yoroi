export type GovernanceVote = {kind: 'abstain'} | {kind: 'no-confidence'} | {kind: 'delegate'; drepID: string}

export enum GovernanceKindMap {
  abstain = 'Abstain',
  delegate = 'Delegate',
  'no-confidence' = 'No Confidence',
}
