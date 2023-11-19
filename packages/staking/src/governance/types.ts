import {Balance} from '@yoroi/types'
import Quantity = Balance.Quantity

export type Anchor = string | undefined // (a URL to a JSON payload of metadata) OR (a hash of the contents of the metadata URL)
export type DRepId = string // The blake2b-224 hash digest of a serialized DRep credential is called the DRep ID.
export type GovernanceActionId = string // Consists of the transaction hash that created it and the index within the transaction body that points to it

export type DRepRetirementCertificate = {
  drepId: DRepId
  retirement: number // the epoch number after which the DRep will retire
  anchor: Anchor
}

export type DRep = {
  credential: DRepCredential
  id: DRepId
  deposit: Quantity
  anchor: Anchor
}

export type DRepCredential =
  | {variant: 'verification-key'; key: string /* Ed25519 */}
  | {variant: 'plutus-script'; plutusScriptData: string}
