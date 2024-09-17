export type AddressJSON = string
export type URLJSON = string

export interface AnchorJSON {
  anchor_data_hash: string
  anchor_url: URLJSON
}
export type AnchorDataHashJSON = string
export type AssetNameJSON = string
export type AssetNamesJSON = string[]
export interface AssetsJSON {
  [k: string]: string
}
export type NativeScriptJSON =
  | {
      ScriptPubkey: ScriptPubkeyJSON
    }
  | {
      ScriptAll: ScriptAllJSON
    }
  | {
      ScriptAny: ScriptAnyJSON
    }
  | {
      ScriptNOfK: ScriptNOfKJSON
    }
  | {
      TimelockStart: TimelockStartJSON
    }
  | {
      TimelockExpiry: TimelockExpiryJSON
    }
export type NativeScriptsJSON = NativeScriptJSON[]
export type PlutusScriptsJSON = string[]

export interface AuxiliaryDataJSON {
  metadata?: {
    [k: string]: string
  } | null
  native_scripts?: NativeScriptsJSON | null
  plutus_scripts?: PlutusScriptsJSON | null
  prefer_alonzo_format: boolean
}
export interface ScriptPubkeyJSON {
  addr_keyhash: string
}
export interface ScriptAllJSON {
  native_scripts: NativeScriptsJSON
}
export interface ScriptAnyJSON {
  native_scripts: NativeScriptsJSON
}
export interface ScriptNOfKJSON {
  n: number
  native_scripts: NativeScriptsJSON
}
export interface TimelockStartJSON {
  slot: string
}
export interface TimelockExpiryJSON {
  slot: string
}
export type AuxiliaryDataHashJSON = string
export interface AuxiliaryDataSetJSON {
  [k: string]: AuxiliaryDataJSON
}
export type BigIntJSON = string
export type BigNumJSON = string
export type VkeyJSON = string
export type HeaderLeaderCertEnumJSON =
  | {
      /**
       * @minItems 2
       * @maxItems 2
       */
      NonceAndLeader: [VRFCertJSON, VRFCertJSON]
    }
  | {
      VrfResult: VRFCertJSON
    }
export type CertificateJSON =
  | {
      StakeRegistration: StakeRegistrationJSON
    }
  | {
      StakeDeregistration: StakeDeregistrationJSON
    }
  | {
      StakeDelegation: StakeDelegationJSON
    }
  | {
      PoolRegistration: PoolRegistrationJSON
    }
  | {
      PoolRetirement: PoolRetirementJSON
    }
  | {
      GenesisKeyDelegation: GenesisKeyDelegationJSON
    }
  | {
      MoveInstantaneousRewardsCert: MoveInstantaneousRewardsCertJSON
    }
  | {
      CommitteeHotAuth: CommitteeHotAuthJSON
    }
  | {
      CommitteeColdResign: CommitteeColdResignJSON
    }
  | {
      DRepDeregistration: DRepDeregistrationJSON
    }
  | {
      DRepRegistration: DRepRegistrationJSON
    }
  | {
      DRepUpdate: DRepUpdateJSON
    }
  | {
      StakeAndVoteDelegation: StakeAndVoteDelegationJSON
    }
  | {
      StakeRegistrationAndDelegation: StakeRegistrationAndDelegationJSON
    }
  | {
      StakeVoteRegistrationAndDelegation: StakeVoteRegistrationAndDelegationJSON
    }
  | {
      VoteDelegation: VoteDelegationJSON
    }
  | {
      VoteRegistrationAndDelegation: VoteRegistrationAndDelegationJSON
    }
export type CredTypeJSON =
  | {
      Key: string
    }
  | {
      Script: string
    }
export type RelayJSON =
  | {
      SingleHostAddr: SingleHostAddrJSON
    }
  | {
      SingleHostName: SingleHostNameJSON
    }
  | {
      MultiHostName: MultiHostNameJSON
    }
/**
 * @minItems 4
 * @maxItems 4
 */
export type Ipv4JSON = [number, number, number, number]
/**
 * @minItems 16
 * @maxItems 16
 */
export type Ipv6JSON = [
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
export type DNSRecordAorAAAAJSON = string
export type DNSRecordSRVJSON = string
export type RelaysJSON = RelayJSON[]
export type MIRPotJSON = 'Reserves' | 'Treasury'
export type MIREnumJSON =
  | {
      ToOtherPot: string
    }
  | {
      ToStakeCredentials: StakeToCoinJSON[]
    }
export type DRepJSON =
  | ('AlwaysAbstain' | 'AlwaysNoConfidence')
  | {
      KeyHash: string
    }
  | {
      ScriptHash: string
    }
export type DataOptionJSON =
  | {
      DataHash: string
    }
  | {
      Data: string
    }
export type ScriptRefJSON =
  | {
      NativeScript: NativeScriptJSON
    }
  | {
      PlutusScript: string
    }
export type MintJSON = [string, MintAssetsJSON][]
export type NetworkIdJSON = 'Testnet' | 'Mainnet'
export type TransactionOutputsJSON = TransactionOutputJSON[]
export type CostModelJSON = string[]
export type VoterJSON =
  | {
      ConstitutionalCommitteeHotCred: CredTypeJSON
    }
  | {
      DRep: CredTypeJSON
    }
  | {
      StakingPool: string
    }
export type VoteKindJSON = 'No' | 'Yes' | 'Abstain'
export type GovernanceActionJSON =
  | {
      ParameterChangeAction: ParameterChangeActionJSON
    }
  | {
      HardForkInitiationAction: HardForkInitiationActionJSON
    }
  | {
      TreasuryWithdrawalsAction: TreasuryWithdrawalsActionJSON
    }
  | {
      NoConfidenceAction: NoConfidenceActionJSON
    }
  | {
      UpdateCommitteeAction: UpdateCommitteeActionJSON
    }
  | {
      NewConstitutionAction: NewConstitutionActionJSON
    }
  | {
      InfoAction: InfoActionJSON
    }
/**
 * @minItems 0
 * @maxItems 0
 */
export type InfoActionJSON = []
export type TransactionBodiesJSON = TransactionBodyJSON[]
export type RedeemerTagJSON = 'Spend' | 'Mint' | 'Cert' | 'Reward' | 'Vote' | 'VotingProposal'
export type TransactionWitnessSetsJSON = TransactionWitnessSetJSON[]

export interface BlockJSON {
  auxiliary_data_set: {
    [k: string]: AuxiliaryDataJSON
  }
  header: HeaderJSON
  invalid_transactions: number[]
  transaction_bodies: TransactionBodiesJSON
  transaction_witness_sets: TransactionWitnessSetsJSON
}
export interface HeaderJSON {
  body_signature: string
  header_body: HeaderBodyJSON
}
export interface HeaderBodyJSON {
  block_body_hash: string
  block_body_size: number
  block_number: number
  issuer_vkey: VkeyJSON
  leader_cert: HeaderLeaderCertEnumJSON
  operational_cert: OperationalCertJSON
  prev_hash?: string | null
  protocol_version: ProtocolVersionJSON
  slot: string
  vrf_vkey: string
}
export interface VRFCertJSON {
  output: number[]
  proof: number[]
}
export interface OperationalCertJSON {
  hot_vkey: string
  kes_period: number
  sequence_number: number
  sigma: string
}
export interface ProtocolVersionJSON {
  major: number
  minor: number
}
export interface TransactionBodyJSON {
  auxiliary_data_hash?: string | null
  certs?: CertificateJSON[] | null
  collateral?: TransactionInputJSON[] | null
  collateral_return?: TransactionOutputJSON | null
  current_treasury_value?: string | null
  donation?: string | null
  fee: string
  inputs: TransactionInputJSON[]
  mint?: MintJSON | null
  network_id?: NetworkIdJSON | null
  outputs: TransactionOutputsJSON
  reference_inputs?: TransactionInputJSON[] | null
  required_signers?: string[] | null
  script_data_hash?: string | null
  total_collateral?: string | null
  ttl?: string | null
  update?: UpdateJSON | null
  validity_start_interval?: string | null
  voting_procedures?: VoterVotesJSON[] | null
  voting_proposals?: VotingProposalJSON[] | null
  withdrawals?: {
    [k: string]: string
  } | null
}
export interface StakeRegistrationJSON {
  coin?: string | null
  stake_credential: CredTypeJSON
}
export interface StakeDeregistrationJSON {
  coin?: string | null
  stake_credential: CredTypeJSON
}
export interface StakeDelegationJSON {
  pool_keyhash: string
  stake_credential: CredTypeJSON
}
export interface PoolRegistrationJSON {
  pool_params: PoolParamsJSON
}
export interface PoolParamsJSON {
  cost: string
  margin: UnitIntervalJSON
  operator: string
  pledge: string
  pool_metadata?: PoolMetadataJSON | null
  pool_owners: string[]
  relays: RelaysJSON
  reward_account: string
  vrf_keyhash: string
}
export interface UnitIntervalJSON {
  denominator: string
  numerator: string
}
export interface PoolMetadataJSON {
  pool_metadata_hash: string
  url: URLJSON
}
export interface SingleHostAddrJSON {
  ipv4?: Ipv4JSON | null
  ipv6?: Ipv6JSON | null
  port?: number | null
}
export interface SingleHostNameJSON {
  dns_name: DNSRecordAorAAAAJSON
  port?: number | null
}
export interface MultiHostNameJSON {
  dns_name: DNSRecordSRVJSON
}
export interface PoolRetirementJSON {
  epoch: number
  pool_keyhash: string
}
export interface GenesisKeyDelegationJSON {
  genesis_delegate_hash: string
  genesishash: string
  vrf_keyhash: string
}
export interface MoveInstantaneousRewardsCertJSON {
  move_instantaneous_reward: MoveInstantaneousRewardJSON
}
export interface MoveInstantaneousRewardJSON {
  pot: MIRPotJSON
  variant: MIREnumJSON
}
export interface StakeToCoinJSON {
  amount: string
  stake_cred: CredTypeJSON
}
export interface CommitteeHotAuthJSON {
  committee_cold_credential: CredTypeJSON
  committee_hot_credential: CredTypeJSON
}
export interface CommitteeColdResignJSON {
  anchor?: AnchorJSON | null
  committee_cold_credential: CredTypeJSON
}
export interface DRepDeregistrationJSON {
  coin: string
  voting_credential: CredTypeJSON
}
export interface DRepRegistrationJSON {
  anchor?: AnchorJSON | null
  coin: string
  voting_credential: CredTypeJSON
}
export interface DRepUpdateJSON {
  anchor?: AnchorJSON | null
  voting_credential: CredTypeJSON
}
export interface StakeAndVoteDelegationJSON {
  drep: DRepJSON
  pool_keyhash: string
  stake_credential: CredTypeJSON
}
export interface StakeRegistrationAndDelegationJSON {
  coin: string
  pool_keyhash: string
  stake_credential: CredTypeJSON
}
export interface StakeVoteRegistrationAndDelegationJSON {
  coin: string
  drep: DRepJSON
  pool_keyhash: string
  stake_credential: CredTypeJSON
}
export interface VoteDelegationJSON {
  drep: DRepJSON
  stake_credential: CredTypeJSON
}
export interface VoteRegistrationAndDelegationJSON {
  coin: string
  drep: DRepJSON
  stake_credential: CredTypeJSON
}
export interface TransactionInputJSON {
  index: number
  transaction_id: string
}
export interface TransactionOutputJSON {
  address: string
  amount: ValueJSON
  plutus_data?: DataOptionJSON | null
  script_ref?: ScriptRefJSON | null
}
export interface ValueJSON {
  coin: string
  multiasset?: MultiAssetJSON | null
}
export interface MultiAssetJSON {
  [k: string]: AssetsJSON
}
export interface MintAssetsJSON {
  [k: string]: string
}
export interface UpdateJSON {
  epoch: number
  proposed_protocol_parameter_updates: {
    [k: string]: ProtocolParamUpdateJSON
  }
}
export interface ProtocolParamUpdateJSON {
  ada_per_utxo_byte?: string | null
  collateral_percentage?: number | null
  committee_term_limit?: number | null
  cost_models?: CostmdlsJSON | null
  d?: UnitIntervalJSON | null
  drep_deposit?: string | null
  drep_inactivity_period?: number | null
  drep_voting_thresholds?: DRepVotingThresholdsJSON | null
  execution_costs?: ExUnitPricesJSON | null
  expansion_rate?: UnitIntervalJSON | null
  extra_entropy?: NonceJSON | null
  governance_action_deposit?: string | null
  governance_action_validity_period?: number | null
  key_deposit?: string | null
  max_block_body_size?: number | null
  max_block_ex_units?: ExUnitsJSON | null
  max_block_header_size?: number | null
  max_collateral_inputs?: number | null
  max_epoch?: number | null
  max_tx_ex_units?: ExUnitsJSON | null
  max_tx_size?: number | null
  max_value_size?: number | null
  min_committee_size?: number | null
  min_pool_cost?: string | null
  minfee_a?: string | null
  minfee_b?: string | null
  n_opt?: number | null
  pool_deposit?: string | null
  pool_pledge_influence?: UnitIntervalJSON | null
  pool_voting_thresholds?: PoolVotingThresholdsJSON | null
  protocol_version?: ProtocolVersionJSON | null
  ref_script_coins_per_byte?: UnitIntervalJSON | null
  treasury_growth_rate?: UnitIntervalJSON | null
}
export interface CostmdlsJSON {
  [k: string]: CostModelJSON
}
export interface DRepVotingThresholdsJSON {
  committee_no_confidence: UnitIntervalJSON
  committee_normal: UnitIntervalJSON
  hard_fork_initiation: UnitIntervalJSON
  motion_no_confidence: UnitIntervalJSON
  pp_economic_group: UnitIntervalJSON
  pp_governance_group: UnitIntervalJSON
  pp_network_group: UnitIntervalJSON
  pp_technical_group: UnitIntervalJSON
  treasury_withdrawal: UnitIntervalJSON
  update_constitution: UnitIntervalJSON
}
export interface ExUnitPricesJSON {
  mem_price: UnitIntervalJSON
  step_price: UnitIntervalJSON
}
export interface NonceJSON {
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
export interface ExUnitsJSON {
  mem: string
  steps: string
}
export interface PoolVotingThresholdsJSON {
  committee_no_confidence: UnitIntervalJSON
  committee_normal: UnitIntervalJSON
  hard_fork_initiation: UnitIntervalJSON
  motion_no_confidence: UnitIntervalJSON
  security_relevant_threshold: UnitIntervalJSON
}
export interface VoterVotesJSON {
  voter: VoterJSON
  votes: VoteJSON[]
}
export interface VoteJSON {
  action_id: GovernanceActionIdJSON
  voting_procedure: VotingProcedureJSON
}
export interface GovernanceActionIdJSON {
  index: number
  transaction_id: string
}
export interface VotingProcedureJSON {
  anchor?: AnchorJSON | null
  vote: VoteKindJSON
}
export interface VotingProposalJSON {
  anchor: AnchorJSON
  deposit: string
  governance_action: GovernanceActionJSON
  reward_account: string
}
export interface ParameterChangeActionJSON {
  gov_action_id?: GovernanceActionIdJSON | null
  policy_hash?: string | null
  protocol_param_updates: ProtocolParamUpdateJSON
}
export interface HardForkInitiationActionJSON {
  gov_action_id?: GovernanceActionIdJSON | null
  protocol_version: ProtocolVersionJSON
}
export interface TreasuryWithdrawalsActionJSON {
  policy_hash?: string | null
  withdrawals: TreasuryWithdrawalsJSON
}
export interface TreasuryWithdrawalsJSON {
  [k: string]: string
}
export interface NoConfidenceActionJSON {
  gov_action_id?: GovernanceActionIdJSON | null
}
export interface UpdateCommitteeActionJSON {
  committee: CommitteeJSON
  gov_action_id?: GovernanceActionIdJSON | null
  members_to_remove: CredTypeJSON[]
}
export interface CommitteeJSON {
  members: CommitteeMemberJSON[]
  quorum_threshold: UnitIntervalJSON
}
export interface CommitteeMemberJSON {
  stake_credential: CredTypeJSON
  term_limit: number
}
export interface NewConstitutionActionJSON {
  constitution: ConstitutionJSON
  gov_action_id?: GovernanceActionIdJSON | null
}
export interface ConstitutionJSON {
  anchor: AnchorJSON
  script_hash?: string | null
}
export interface TransactionWitnessSetJSON {
  bootstraps?: BootstrapWitnessJSON[] | null
  native_scripts?: NativeScriptsJSON | null
  plutus_data?: PlutusListJSON | null
  plutus_scripts?: PlutusScriptsJSON | null
  redeemers?: RedeemerJSON[] | null
  vkeys?: VkeywitnessJSON[] | null
}
export interface BootstrapWitnessJSON {
  attributes: number[]
  chain_code: number[]
  signature: string
  vkey: VkeyJSON
}
export interface PlutusListJSON {
  definite_encoding?: boolean | null
  elems: string[]
}
export interface RedeemerJSON {
  data: string
  ex_units: ExUnitsJSON
  index: string
  tag: RedeemerTagJSON
}
export interface VkeywitnessJSON {
  signature: string
  vkey: VkeyJSON
}
export type BlockHashJSON = string
export type BootstrapWitnessesJSON = BootstrapWitnessJSON[]

export type CertificateEnumJSON =
  | {
      StakeRegistration: StakeRegistrationJSON
    }
  | {
      StakeDeregistration: StakeDeregistrationJSON
    }
  | {
      StakeDelegation: StakeDelegationJSON
    }
  | {
      PoolRegistration: PoolRegistrationJSON
    }
  | {
      PoolRetirement: PoolRetirementJSON
    }
  | {
      GenesisKeyDelegation: GenesisKeyDelegationJSON
    }
  | {
      MoveInstantaneousRewardsCert: MoveInstantaneousRewardsCertJSON
    }
  | {
      CommitteeHotAuth: CommitteeHotAuthJSON
    }
  | {
      CommitteeColdResign: CommitteeColdResignJSON
    }
  | {
      DRepDeregistration: DRepDeregistrationJSON
    }
  | {
      DRepRegistration: DRepRegistrationJSON
    }
  | {
      DRepUpdate: DRepUpdateJSON
    }
  | {
      StakeAndVoteDelegation: StakeAndVoteDelegationJSON
    }
  | {
      StakeRegistrationAndDelegation: StakeRegistrationAndDelegationJSON
    }
  | {
      StakeVoteRegistrationAndDelegation: StakeVoteRegistrationAndDelegationJSON
    }
  | {
      VoteDelegation: VoteDelegationJSON
    }
  | {
      VoteRegistrationAndDelegation: VoteRegistrationAndDelegationJSON
    }
export type CertificatesJSON = CertificateJSON[]

export type CredentialJSON = CredTypeJSON
export type CredentialsJSON = CredTypeJSON[]
export type DRepEnumJSON =
  | ('AlwaysAbstain' | 'AlwaysNoConfidence')
  | {
      KeyHash: string
    }
  | {
      ScriptHash: string
    }
export type DataHashJSON = string
export type Ed25519KeyHashJSON = string
export type Ed25519KeyHashesJSON = string[]
export type Ed25519SignatureJSON = string
export interface GeneralTransactionMetadataJSON {
  [k: string]: string
}
export type GenesisDelegateHashJSON = string
export type GenesisHashJSON = string
export type GenesisHashesJSON = string[]
export type GovernanceActionEnumJSON =
  | {
      ParameterChangeAction: ParameterChangeActionJSON
    }
  | {
      HardForkInitiationAction: HardForkInitiationActionJSON
    }
  | {
      TreasuryWithdrawalsAction: TreasuryWithdrawalsActionJSON
    }
  | {
      NoConfidenceAction: NoConfidenceActionJSON
    }
  | {
      UpdateCommitteeAction: UpdateCommitteeActionJSON
    }
  | {
      NewConstitutionAction: NewConstitutionActionJSON
    }
  | {
      InfoAction: InfoActionJSON
    }
export type GovernanceActionIdsJSON = GovernanceActionIdJSON[]

export type IntJSON = string
/**
 * @minItems 4
 * @maxItems 4
 */
export type KESVKeyJSON = string
export type LanguageJSON = LanguageKindJSON
export type LanguageKindJSON = 'PlutusV1' | 'PlutusV2' | 'PlutusV3'
export type LanguagesJSON = LanguageJSON[]
export type MIRToStakeCredentialsJSON = StakeToCoinJSON[]

export type MintsAssetsJSON = MintAssetsJSON[]

export type NetworkIdKindJSON = 'Testnet' | 'Mainnet'
export type PlutusScriptJSON = string
export type PoolMetadataHashJSON = string
export interface ProposedProtocolParameterUpdatesJSON {
  [k: string]: ProtocolParamUpdateJSON
}
export type PublicKeyJSON = string
export type RedeemerTagKindJSON = 'Spend' | 'Mint' | 'Cert' | 'Reward' | 'Vote' | 'VotingProposal'
export type RedeemersJSON = RedeemerJSON[]

export type RelayEnumJSON =
  | {
      SingleHostAddr: SingleHostAddrJSON
    }
  | {
      SingleHostName: SingleHostNameJSON
    }
  | {
      MultiHostName: MultiHostNameJSON
    }
/**
 * @minItems 4
 * @maxItems 4
 */
export type RewardAddressJSON = string
export type RewardAddressesJSON = string[]
export type ScriptDataHashJSON = string
export type ScriptHashJSON = string
export type ScriptHashesJSON = string[]
export type ScriptRefEnumJSON =
  | {
      NativeScript: NativeScriptJSON
    }
  | {
      PlutusScript: string
    }
export interface TransactionJSON {
  auxiliary_data?: AuxiliaryDataJSON | null
  body: TransactionBodyJSON
  is_valid: boolean
  witness_set: TransactionWitnessSetJSON
}
export type TransactionHashJSON = string
export type TransactionInputsJSON = TransactionInputJSON[]

export type TransactionMetadatumJSON = string
export interface TransactionUnspentOutputJSON {
  input: TransactionInputJSON
  output: TransactionOutputJSON
}
export type TransactionUnspentOutputsJSON = TransactionUnspentOutputJSON[]

export type VRFKeyHashJSON = string
export type VRFVKeyJSON = string
export interface VersionedBlockJSON {
  block: BlockJSON
  era_code: number
}
export type VkeywitnessesJSON = VkeywitnessJSON[]

export type VoterEnumJSON =
  | {
      ConstitutionalCommitteeHotCred: CredTypeJSON
    }
  | {
      DRep: CredTypeJSON
    }
  | {
      StakingPool: string
    }
export type VotersJSON = VoterJSON[]
export type VotingProceduresJSON = VoterVotesJSON[]

export type VotingProposalsJSON = VotingProposalJSON[]

export interface WithdrawalsJSON {
  [k: string]: string
}
