export type GovernanceVote =
  | {kind: 'abstain'}
  | {kind: 'no-confidence'}
  | {kind: 'delegate'; hash: string; type: 'key' | 'script'}

export enum GovernanceKindMap {
  abstain = 'Abstain',
  delegate = 'Delegate',
  'no-confidence' = 'No Confidence',
}
