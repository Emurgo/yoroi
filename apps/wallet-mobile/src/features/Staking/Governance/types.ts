export type UserAction =
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
