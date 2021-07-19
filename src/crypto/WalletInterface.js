// @flow

// TODO(v-almonacid): transactionCache should be decoupled from this class.
// Use an interface instead

import {BigNumber} from 'bignumber.js'
import {type IntlShape} from 'react-intl'

import {AddressChain} from './shelley/chain'
import {TransactionCache} from './shelley/transactionCache'
import Wallet from './Wallet'
import {ISignRequest} from './ISignRequest'
import {MultiToken} from './MultiToken'

import type {
  RawUtxo,
  TxBodiesRequest,
  TxBodiesResponse,
  ServerStatusResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  TokenInfoRequest,
  TokenInfoResponse,
  FundInfoResponse,
  AccountStateResponse,
} from '../api/types'
import type {AddressedUtxo, EncryptionMethod, SendTokenList, SignedTx, WalletState} from './types'
import type {DefaultTokenEntry} from './MultiToken'
import type {HWDeviceInfo} from './shelley/ledgerUtils'
import type {DelegationStatus} from './shelley/delegationUtils'
import type {NetworkId, WalletImplementationId} from '../config/types'
import type {WalletMeta} from '../state'
import type {Transaction, DefaultAsset} from '../types/HistoryTransaction'
import type {Addresses} from './shelley/chain'
import type {WalletChecksum} from '@emurgo/cip4-js'
import type {JSONMetadata} from './shelley/metadataUtils'

export interface WalletInterface {
  id: string;

  networkId: NetworkId;

  walletImplementationId: WalletImplementationId;

  isHW: boolean;

  hwDeviceInfo: ?HWDeviceInfo;

  isReadOnly: boolean;

  isEasyConfirmationEnabled: boolean;

  internalChain: AddressChain;

  externalChain: AddressChain;

  // note: currently not exposed to redux's store
  publicKeyHex: string;

  // note: exposed to redux's store but not in storage (as it can be derived)
  rewardAddressHex: ?string;

  // last known version the wallet has been opened on
  // note: Prior to v4.1.0, `version` was set upon wallet creation/restoration
  // and was never updated. Starting from v4.1.0, we instead store the
  // last version the wallet has been *opened* on, since this is the actual
  // relevant information we need to decide on whether migrations are needed.
  // Saved in storage but not exposed to redux's store.
  version: ?string;

  state: WalletState;

  isInitialized: boolean;

  transactionCache: TransactionCache;

  checksum: WalletChecksum;

  // =================== getters =================== //

  get internalAddresses(): Addresses;

  get externalAddresses(): Addresses;

  get isUsedAddressIndex(): Dict<boolean>;

  get numReceiveAddresses(): number;

  get transactions(): Dict<Transaction>;

  get confirmationCounts(): Dict<number>;

  // =================== create =================== //

  create(
    mnemonic: string,
    newPassword: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
  ): Promise<string>;

  createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    implementationId: WalletImplementationId,
    hwDeviceInfo: ?HWDeviceInfo,
    isReadOnly: boolean,
  ): Promise<string>;

  // ============ security & key management ============ //

  encryptAndSaveMasterKey(encryptionMethod: EncryptionMethod, masterKey: string, password?: string): Promise<void>;

  getDecryptedMasterKey(masterPassword: string, intl: IntlShape): Promise<string>;

  enableEasyConfirmation(masterPassword: string, intl: IntlShape): Promise<void>;

  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>;

  // =================== subscriptions =================== //

  subscribe(handler: (Wallet) => any): void;
  subscribeOnTxHistoryUpdate(handler: () => any): void;

  // =================== synch =================== //

  doFullSync(): Promise<Dict<Transaction>>;

  tryDoFullSync(): Promise<Dict<Transaction> | null>;

  // =================== state/UI =================== //

  canGenerateNewReceiveAddress(): boolean;

  generateNewUiReceiveAddressIfNeeded(): boolean;

  generateNewUiReceiveAddress(): boolean;

  // =================== persistence =================== //

  // TODO: type
  toJSON(): any;

  restore(data: any, walletMeta: WalletMeta): Promise<void>;

  // =================== tx building =================== //

  // not exposed to wallet manager, consider removing
  getChangeAddress(): string;

  getAllUtxosForKey(utxos: Array<RawUtxo>): Promise<Array<AddressedUtxo>>;

  getAddressingInfo(address: string): any;

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo>;

  getDelegationStatus(): Promise<DelegationStatus>;

  createUnsignedTx<T>(
    utxos: Array<RawUtxo>,
    receiver: string,
    tokens: SendTokenList,
    defaultToken: DefaultTokenEntry,
    serverTime: Date | void,
    metadata: Array<JSONMetadata> | void,
  ): Promise<ISignRequest<T>>;

  signTx<T>(signRequest: ISignRequest<T>, decryptedMasterKey: string): Promise<SignedTx>;

  createDelegationTx<T>(
    poolRequest: void | string,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
    defaultAsset: DefaultAsset,
    serverTime: Date | void,
  ): Promise<{
    signRequest: ISignRequest<T>,
    totalAmountToDelegate: MultiToken,
  }>;

  createVotingRegTx<T>(
    utxos: Array<RawUtxo>,
    catalystPrivateKey: string,
    decryptedKey: string | void,
    serverTime: Date | void,
  ): Promise<ISignRequest<T>>;

  createWithdrawalTx<T>(
    utxos: Array<RawUtxo>,
    shouldDeregister: boolean,
    serverTime: Date | void,
  ): Promise<ISignRequest<T>>;

  signTxWithLedger<T>(request: ISignRequest<T>, useUSB: boolean): Promise<SignedTx>;

  // =================== backend API =================== //

  checkServerStatus(): Promise<ServerStatusResponse>;

  submitTransaction(signedTx: string): Promise<[]>;

  getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse>;

  fetchUTXOs(): Promise<Array<RawUtxo>>;

  fetchAccountState(): Promise<AccountStateResponse>;

  fetchPoolInfo(request: PoolInfoRequest): Promise<PoolInfoResponse>;

  fetchTokenInfo(request: TokenInfoRequest): Promise<TokenInfoResponse>;

  fetchFundInfo(): Promise<FundInfoResponse>;
}
