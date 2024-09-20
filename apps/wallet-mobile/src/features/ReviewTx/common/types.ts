import {Balance} from '@yoroi/types'

import {useFormattedTx} from './hooks/useFormattedTx'

export type TransactionDetails = {
  id: string
  walletPlate: React.ReactNode
  walletName: string
  createdBy: string | null
  fee: string
  txBody: TransactionBody
}

export type Address = string
export type URL = string

export interface Anchor {
  anchor_data_hash: string
  anchor_url: URL
}
export type AnchorDataHash = string
export type AssetName = string
export type AssetNames = string[]
export interface Assets {
  [k: string]: string
}
export type NativeScript =
  | {
      ScriptPubkey: ScriptPubkey
    }
  | {
      ScriptAll: ScriptAll
    }
  | {
      ScriptAny: ScriptAny
    }
  | {
      ScriptNOfK: ScriptNOfK
    }
  | {
      TimelockStart: TimelockStart
    }
  | {
      TimelockExpiry: TimelockExpiry
    }
export type NativeScripts = NativeScript[]
export type PlutusScripts = string[]

export interface AuxiliaryData {
  metadata?: {
    [k: string]: string
  } | null
  native_scripts?: NativeScripts | null
  plutus_scripts?: PlutusScripts | null
  prefer_alonzo_format: boolean
}
export interface ScriptPubkey {
  addr_keyhash: string
}
export interface ScriptAll {
  native_scripts: NativeScripts
}
export interface ScriptAny {
  native_scripts: NativeScripts
}
export interface ScriptNOfK {
  n: number
  native_scripts: NativeScripts
}
export interface TimelockStart {
  slot: string
}
export interface TimelockExpiry {
  slot: string
}
export type AuxiliaryDataHash = string
export interface AuxiliaryDataSet {
  [k: string]: AuxiliaryData
}
export type BigInt = string
export type BigNum = string
export type Vkey = string
export type HeaderLeaderCertEnum =
  | {
      /**
       * @minItems 2
       * @maxItems 2
       */
      NonceAndLeader: [VRFCert, VRFCert]
    }
  | {
      VrfResult: VRFCert
    }
export type Certificate =
  | {
      StakeRegistration: StakeRegistration
    }
  | {
      StakeDeregistration: StakeDeregistration
    }
  | {
      StakeDelegation: StakeDelegation
    }
  | {
      PoolRegistration: PoolRegistration
    }
  | {
      PoolRetirement: PoolRetirement
    }
  | {
      GenesisKeyDelegation: GenesisKeyDelegation
    }
  | {
      MoveInstantaneousRewardsCert: MoveInstantaneousRewardsCert
    }
  | {
      CommitteeHotAuth: CommitteeHotAuth
    }
  | {
      CommitteeColdResign: CommitteeColdResign
    }
  | {
      DRepDeregistration: DRepDeregistration
    }
  | {
      DRepRegistration: DRepRegistration
    }
  | {
      DRepUpdate: DRepUpdate
    }
  | {
      StakeAndVoteDelegation: StakeAndVoteDelegation
    }
  | {
      StakeRegistrationAndDelegation: StakeRegistrationAndDelegation
    }
  | {
      StakeVoteRegistrationAndDelegation: StakeVoteRegistrationAndDelegation
    }
  | {
      VoteDelegation: VoteDelegation
    }
  | {
      VoteRegistrationAndDelegation: VoteRegistrationAndDelegation
    }
export type CredType =
  | {
      Key: string
    }
  | {
      Script: string
    }
export type Relay =
  | {
      SingleHostAddr: SingleHostAddr
    }
  | {
      SingleHostName: SingleHostName
    }
  | {
      MultiHostName: MultiHostName
    }
/**
 * @minItems 4
 * @maxItems 4
 */
export type Ipv4 = [number, number, number, number]
/**
 * @minItems 16
 * @maxItems 16
 */
export type Ipv6 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]
export type DNSRecordAorAAAA = string
export type DNSRecordSRV = string
export type Relays = Relay[]
export type MIRPot = 'Reserves' | 'Treasury'
export type MIREnum =
  | {
      ToOtherPot: string
    }
  | {
      ToStakeCredentials: StakeToCoin[]
    }
export type DRep =
  | ('AlwaysAbstain' | 'AlwaysNoConfidence')
  | {
      KeyHash: string
    }
  | {
      ScriptHash: string
    }
export type DataOption =
  | {
      DataHash: string
    }
  | {
      Data: string
    }
export type ScriptRef =
  | {
      NativeScript: NativeScript
    }
  | {
      PlutusScript: string
    }
export type Mint = [string, MintAssets][]
export type NetworkId = 'Testnet' | 'Mainnet'
export type TransactionOutputs = TransactionOutput[]
export type CostModel = string[]
export type Voter =
  | {
      ConstitutionalCommitteeHotCred: CredType
    }
  | {
      DRep: CredType
    }
  | {
      StakingPool: string
    }
export type VoteKind = 'No' | 'Yes' | 'Abstain'
export type GovernanceAction =
  | {
      ParameterChangeAction: ParameterChangeAction
    }
  | {
      HardForkInitiationAction: HardForkInitiationAction
    }
  | {
      TreasuryWithdrawalsAction: TreasuryWithdrawalsAction
    }
  | {
      NoConfidenceAction: NoConfidenceAction
    }
  | {
      UpdateCommitteeAction: UpdateCommitteeAction
    }
  | {
      NewConstitutionAction: NewConstitutionAction
    }
  | {
      InfoAction: InfoAction
    }
/**
 * @minItems 0
 * @maxItems 0
 */
export type InfoAction = []
export type TransactionBodies = TransactionBody[]
export type RedeemerTag = 'Spend' | 'Mint' | 'Cert' | 'Reward' | 'Vote' | 'VotingProposal'
export type TransactionWitnessSets = TransactionWitnessSet[]

export interface Block {
  auxiliary_data_set: {
    [k: string]: AuxiliaryData
  }
  header: Header
  invalid_transactions: number[]
  transaction_bodies: TransactionBodies
  transaction_witness_sets: TransactionWitnessSets
}
export interface Header {
  body_signature: string
  header_body: HeaderBody
}
export interface HeaderBody {
  block_body_hash: string
  block_body_size: number
  block_number: number
  issuer_vkey: Vkey
  leader_cert: HeaderLeaderCertEnum
  operational_cert: OperationalCert
  prev_hash?: string | null
  protocol_version: ProtocolVersion
  slot: string
  vrf_vkey: string
}
export interface VRFCert {
  output: number[]
  proof: number[]
}
export interface OperationalCert {
  hot_vkey: string
  kes_period: number
  sequence_number: number
  sigma: string
}
export interface ProtocolVersion {
  major: number
  minor: number
}
export interface TransactionBody {
  auxiliary_data_hash?: string | null
  certs?: Certificate[] | null
  collateral?: TransactionInput[] | null
  collateral_return?: TransactionOutput | null
  current_treasury_value?: string | null
  donation?: string | null
  fee: string
  inputs: TransactionInput[]
  mint?: Mint | null
  network_id?: NetworkId | null
  outputs: TransactionOutputs
  reference_inputs?: TransactionInput[] | null
  required_signers?: string[] | null
  script_data_hash?: string | null
  total_collateral?: string | null
  ttl?: string | null
  update?: Update | null
  validity_start_interval?: string | null
  voting_procedures?: VoterVotes[] | null
  voting_proposals?: VotingProposal[] | null
  withdrawals?: {
    [k: string]: string
  } | null
}
export interface StakeRegistration {
  coin?: string | null
  stake_credential: CredType
}
export interface StakeDeregistration {
  coin?: string | null
  stake_credential: CredType
}
export interface StakeDelegation {
  pool_keyhash: string
  stake_credential: CredType
}
export interface PoolRegistration {
  pool_params: PoolParams
}
export interface PoolParams {
  cost: string
  margin: UnitInterval
  operator: string
  pledge: string
  pool_metadata?: PoolMetadata | null
  pool_owners: string[]
  relays: Relays
  reward_account: string
  vrf_keyhash: string
}
export interface UnitInterval {
  denominator: string
  numerator: string
}
export interface PoolMetadata {
  pool_metadata_hash: string
  url: URL
}
export interface SingleHostAddr {
  ipv4?: Ipv4 | null
  ipv6?: Ipv6 | null
  port?: number | null
}
export interface SingleHostName {
  dns_name: DNSRecordAorAAAA
  port?: number | null
}
export interface MultiHostName {
  dns_name: DNSRecordSRV
}
export interface PoolRetirement {
  epoch: number
  pool_keyhash: string
}
export interface GenesisKeyDelegation {
  genesis_delegate_hash: string
  genesishash: string
  vrf_keyhash: string
}
export interface MoveInstantaneousRewardsCert {
  move_instantaneous_reward: MoveInstantaneousReward
}
export interface MoveInstantaneousReward {
  pot: MIRPot
  variant: MIREnum
}
export interface StakeToCoin {
  amount: string
  stake_cred: CredType
}
export interface CommitteeHotAuth {
  committee_cold_credential: CredType
  committee_hot_credential: CredType
}
export interface CommitteeColdResign {
  anchor?: Anchor | null
  committee_cold_credential: CredType
}
export interface DRepDeregistration {
  coin: string
  voting_credential: CredType
}
export interface DRepRegistration {
  anchor?: Anchor | null
  coin: string
  voting_credential: CredType
}
export interface DRepUpdate {
  anchor?: Anchor | null
  voting_credential: CredType
}
export interface StakeAndVoteDelegation {
  drep: DRep
  pool_keyhash: string
  stake_credential: CredType
}
export interface StakeRegistrationAndDelegation {
  coin: string
  pool_keyhash: string
  stake_credential: CredType
}
export interface StakeVoteRegistrationAndDelegation {
  coin: string
  drep: DRep
  pool_keyhash: string
  stake_credential: CredType
}
export interface VoteDelegation {
  drep: DRep
  stake_credential: CredType
}
export interface VoteRegistrationAndDelegation {
  coin: string
  drep: DRep
  stake_credential: CredType
}
export interface TransactionInput {
  index: number
  transaction_id: string
}
export interface TransactionOutput {
  address: string
  amount: Value
  plutus_data?: DataOption | null
  script_ref?: ScriptRef | null
}
export interface Value {
  coin: string
  multiasset?: MultiAsset | null
}
export interface MultiAsset {
  [k: string]: Assets
}
export interface MintAssets {
  [k: string]: string
}
export interface Update {
  epoch: number
  proposed_protocol_parameter_updates: {
    [k: string]: ProtocolParamUpdate
  }
}
export interface ProtocolParamUpdate {
  ada_per_utxo_byte?: string | null
  collateral_percentage?: number | null
  committee_term_limit?: number | null
  cost_models?: Costmdls | null
  d?: UnitInterval | null
  drep_deposit?: string | null
  drep_inactivity_period?: number | null
  drep_voting_thresholds?: DRepVotingThresholds | null
  execution_costs?: ExUnitPrices | null
  expansion_rate?: UnitInterval | null
  extra_entropy?: Nonce | null
  governance_action_deposit?: string | null
  governance_action_validity_period?: number | null
  key_deposit?: string | null
  max_block_body_size?: number | null
  max_block_ex_units?: ExUnits | null
  max_block_header_size?: number | null
  max_collateral_inputs?: number | null
  max_epoch?: number | null
  max_tx_ex_units?: ExUnits | null
  max_tx_size?: number | null
  max_value_size?: number | null
  min_committee_size?: number | null
  min_pool_cost?: string | null
  minfee_a?: string | null
  minfee_b?: string | null
  n_opt?: number | null
  pool_deposit?: string | null
  pool_pledge_influence?: UnitInterval | null
  pool_voting_thresholds?: PoolVotingThresholds | null
  protocol_version?: ProtocolVersion | null
  ref_script_coins_per_byte?: UnitInterval | null
  treasury_growth_rate?: UnitInterval | null
}
export interface Costmdls {
  [k: string]: CostModel
}
export interface DRepVotingThresholds {
  committee_no_confidence: UnitInterval
  committee_normal: UnitInterval
  hard_fork_initiation: UnitInterval
  motion_no_confidence: UnitInterval
  pp_economic_group: UnitInterval
  pp_governance_group: UnitInterval
  pp_network_group: UnitInterval
  pp_technical_group: UnitInterval
  treasury_withdrawal: UnitInterval
  update_constitution: UnitInterval
}
export interface ExUnitPrices {
  mem_price: UnitInterval
  step_price: UnitInterval
}
export interface Nonce {
  /**
   * @minItems 32
   * @maxItems 32
   */
  hash?:
    | [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ]
    | null
}
export interface ExUnits {
  mem: string
  steps: string
}
export interface PoolVotingThresholds {
  committee_no_confidence: UnitInterval
  committee_normal: UnitInterval
  hard_fork_initiation: UnitInterval
  motion_no_confidence: UnitInterval
  security_relevant_threshold: UnitInterval
}
export interface VoterVotes {
  voter: Voter
  votes: Vote[]
}
export interface Vote {
  action_id: GovernanceActionId
  voting_procedure: VotingProcedure
}
export interface GovernanceActionId {
  index: number
  transaction_id: string
}
export interface VotingProcedure {
  anchor?: Anchor | null
  vote: VoteKind
}
export interface VotingProposal {
  anchor: Anchor
  deposit: string
  governance_action: GovernanceAction
  reward_account: string
}
export interface ParameterChangeAction {
  gov_action_id?: GovernanceActionId | null
  policy_hash?: string | null
  protocol_param_updates: ProtocolParamUpdate
}
export interface HardForkInitiationAction {
  gov_action_id?: GovernanceActionId | null
  protocol_version: ProtocolVersion
}
export interface TreasuryWithdrawalsAction {
  policy_hash?: string | null
  withdrawals: TreasuryWithdrawals
}
export interface TreasuryWithdrawals {
  [k: string]: string
}
export interface NoConfidenceAction {
  gov_action_id?: GovernanceActionId | null
}
export interface UpdateCommitteeAction {
  committee: Committee
  gov_action_id?: GovernanceActionId | null
  members_to_remove: CredType[]
}
export interface Committee {
  members: CommitteeMember[]
  quorum_threshold: UnitInterval
}
export interface CommitteeMember {
  stake_credential: CredType
  term_limit: number
}
export interface NewConstitutionAction {
  constitution: Constitution
  gov_action_id?: GovernanceActionId | null
}
export interface Constitution {
  anchor: Anchor
  script_hash?: string | null
}
export interface TransactionWitnessSet {
  bootstraps?: BootstrapWitness[] | null
  native_scripts?: NativeScripts | null
  plutus_data?: PlutusList | null
  plutus_scripts?: PlutusScripts | null
  redeemers?: Redeemer[] | null
  vkeys?: Vkeywitness[] | null
}
export interface BootstrapWitness {
  attributes: number[]
  chain_code: number[]
  signature: string
  vkey: Vkey
}
export interface PlutusList {
  definite_encoding?: boolean | null
  elems: string[]
}
export interface Redeemer {
  data: string
  ex_units: ExUnits
  index: string
  tag: RedeemerTag
}
export interface Vkeywitness {
  signature: string
  vkey: Vkey
}
export type BlockHash = string
export type BootstrapWitnesses = BootstrapWitness[]

export type CertificateEnum =
  | {
      StakeRegistration: StakeRegistration
    }
  | {
      StakeDeregistration: StakeDeregistration
    }
  | {
      StakeDelegation: StakeDelegation
    }
  | {
      PoolRegistration: PoolRegistration
    }
  | {
      PoolRetirement: PoolRetirement
    }
  | {
      GenesisKeyDelegation: GenesisKeyDelegation
    }
  | {
      MoveInstantaneousRewardsCert: MoveInstantaneousRewardsCert
    }
  | {
      CommitteeHotAuth: CommitteeHotAuth
    }
  | {
      CommitteeColdResign: CommitteeColdResign
    }
  | {
      DRepDeregistration: DRepDeregistration
    }
  | {
      DRepRegistration: DRepRegistration
    }
  | {
      DRepUpdate: DRepUpdate
    }
  | {
      StakeAndVoteDelegation: StakeAndVoteDelegation
    }
  | {
      StakeRegistrationAndDelegation: StakeRegistrationAndDelegation
    }
  | {
      StakeVoteRegistrationAndDelegation: StakeVoteRegistrationAndDelegation
    }
  | {
      VoteDelegation: VoteDelegation
    }
  | {
      VoteRegistrationAndDelegation: VoteRegistrationAndDelegation
    }
export type Certificates = Certificate[]

export type Credential = CredType
export type Credentials = CredType[]
export type DRepEnum =
  | ('AlwaysAbstain' | 'AlwaysNoConfidence')
  | {
      KeyHash: string
    }
  | {
      ScriptHash: string
    }
export type DataHash = string
export type Ed25519KeyHash = string
export type Ed25519KeyHashes = string[]
export type Ed25519Signature = string
export interface GeneralTransactionMetadata {
  [k: string]: string
}
export type GenesisDelegateHash = string
export type GenesisHash = string
export type GenesisHashes = string[]
export type GovernanceActionEnum =
  | {
      ParameterChangeAction: ParameterChangeAction
    }
  | {
      HardForkInitiationAction: HardForkInitiationAction
    }
  | {
      TreasuryWithdrawalsAction: TreasuryWithdrawalsAction
    }
  | {
      NoConfidenceAction: NoConfidenceAction
    }
  | {
      UpdateCommitteeAction: UpdateCommitteeAction
    }
  | {
      NewConstitutionAction: NewConstitutionAction
    }
  | {
      InfoAction: InfoAction
    }
export type GovernanceActionIds = GovernanceActionId[]

export type Int = string
/**
 * @minItems 4
 * @maxItems 4
 */
export type KESVKey = string
export type Language = LanguageKind
export type LanguageKind = 'PlutusV1' | 'PlutusV2' | 'PlutusV3'
export type Languages = Language[]
export type MIRToStakeCredentials = StakeToCoin[]

export type MintsAssets = MintAssets[]

export type NetworkIdKind = 'Testnet' | 'Mainnet'
export type PlutusScript = string
export type PoolMetadataHash = string
export interface ProposedProtocolParameterUpdates {
  [k: string]: ProtocolParamUpdate
}
export type PublicKey = string
export type RedeemerTagKind = 'Spend' | 'Mint' | 'Cert' | 'Reward' | 'Vote' | 'VotingProposal'
export type Redeemers = Redeemer[]

export type RelayEnum =
  | {
      SingleHostAddr: SingleHostAddr
    }
  | {
      SingleHostName: SingleHostName
    }
  | {
      MultiHostName: MultiHostName
    }
/**
 * @minItems 4
 * @maxItems 4
 */
export type RewardAddress = string
export type RewardAddresses = string[]
export type ScriptDataHash = string
export type ScriptHash = string
export type ScriptHashes = string[]
export type ScriptRefEnum =
  | {
      NativeScript: NativeScript
    }
  | {
      PlutusScript: string
    }
export interface Transaction {
  auxiliary_data?: AuxiliaryData | null
  body: TransactionBody
  is_valid: boolean
  witness_set: TransactionWitnessSet
}
export type TransactionHash = string
export type TransactionInputs = TransactionInput[]

export type TransactionMetadatum = string
export interface TransactionUnspentOutput {
  input: TransactionInput
  output: TransactionOutput
}
export type TransactionUnspentOutputs = TransactionUnspentOutput[]

export type VRFKeyHash = string
export type VRFVKey = string
export interface VersionedBlock {
  block: Block
  era_code: number
}
export type Vkeywitnesses = Vkeywitness[]

export type VoterEnum =
  | {
      ConstitutionalCommitteeHotCred: CredType
    }
  | {
      DRep: CredType
    }
  | {
      StakingPool: string
    }
export type Voters = Voter[]
export type VotingProcedures = VoterVotes[]

export type VotingProposals = VotingProposal[]

export interface Withdrawals {
  [k: string]: string
}

export type FormattedInput = {
  assets: Array<{
    name: string
    label: string
    quantity: Balance.Quantity
    isPrimary: boolean
  }>
  address: string | undefined
  rewardAddress: string | null
  ownAddress: boolean
  txIndex: number
  txHash: string
}

export type FormattedInputs = Array<FormattedInput>
export type FormattedTx = ReturnType<typeof useFormattedTx>
export type FormattedOutput = {
  assets: Array<{
    name: string
    label: string
    quantity: Balance.Quantity
    isPrimary: boolean
  }>
  address: string
  rewardAddress: string | null
  ownAddress: boolean
}
export type FormattedOutputs = Array<FormattedOutput>
export type FormattedFee = {
  name: string
  label: string
  quantity: Balance.Quantity
  isPrimary: boolean
}
