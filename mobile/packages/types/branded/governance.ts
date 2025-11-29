import {String} from './utils'

/**
 * Governance types
 */
export type DRepId = String<'DRepId'> // Blake2b-224 hash
export type GovernanceActionId = String<'GovernanceActionId'> // txHash#index
export type AnchorUrl = String<'AnchorUrl'> // URL string
export type AnchorHash = String<'AnchorHash'> // Hash string
