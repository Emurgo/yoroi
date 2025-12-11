import {
  AnchorHash,
  AnchorUrl,
  Balance,
  DRepId,
  EpochNumber,
  GovernanceActionId,
  SlotNumber,
  TransactionHash,
} from '@yoroi/types'

export type Anchor = AnchorUrl | AnchorHash | undefined // (a URL to a JSON payload of metadata) OR (a hash of the contents of the metadata URL)
export type {DRepId} // The blake2b-224 hash digest of a serialized DRep credential is called the DRep ID.
export type {GovernanceActionId} // Consists of the transaction hash that created it and the index within the transaction body that points to it

export type DRepRetirementCertificate = {
  drepId: DRepId
  retirement: number // the epoch number after which the DRep will retire
  anchor: Anchor
}

export type DRepRegistrationCertificate = {
  credential: DRepCredential
  id: DRepId
  deposit: Balance.Quantity
  anchor: Anchor
}

export type DRepCredential =
  | {variant: 'verification-key'; key: string /* Ed25519 */}
  | {variant: 'plutus-script'; plutusScriptData: string}

export type StakingKeyState = {
  drepDelegation?: DelegationBaseInfo &
    (
      | {action: 'no-confidence'}
      | {action: 'abstain'}
      | {action: 'drep'; hash: DRepId; type: 'script' | 'key'}
    )
}

type DelegationBaseInfo = {
  tx: TransactionHash
  epoch: EpochNumber
  slot: SlotNumber
}
