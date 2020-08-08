// @flow
import {BigNumber} from 'bignumber.js'

import {AddressChain} from './chain'
import {TransactionCache} from './transactionCache'
import Wallet from './Wallet'

import type {
  RawUtxo,
  PoolInfoRequest,
  TxBodiesRequest,
  TxBodiesResponse,
} from '../api/types'
import type {
  AddressedUtxo,
  BaseSignRequest,
  EncryptionMethod,
  PreparedTransactionData,
  SignedTx,
  V3SignedTx,
  V3UnsignedTxAddressedUtxoData,
  WalletState,
} from './types'
import type {DelegationTxData, PoolData} from './jormungandr/delegationUtils'
import type {HWDeviceInfo} from './byron/ledgerUtils'
import type {NetworkId} from '../config/types'
import type {Dict} from '../state'
import type {Transaction} from '../types/HistoryTransaction'
import type {Addresses} from './chain'

export interface WalletInterface {
  id: string;

  networkId: NetworkId;

  isHW: boolean;

  hwDeviceInfo: ?HWDeviceInfo;

  isEasyConfirmationEnabled: boolean;

  internalChain: AddressChain;

  externalChain: AddressChain;

  // chimeric account address
  chimericAccountAddress: ?string;

  // last known version the wallet has been created/restored
  version: ?string;

  state: WalletState;

  isInitialized: boolean;

  transactionCache: TransactionCache;

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
  ): Promise<string>;

  createWithBip44Account(
    accountPublicKey: string,
    networkId: NetworkId,
    hwDeviceInfo: ?HWDeviceInfo,
  ): Promise<string>;

  // ============ security & key management ============ //

  encryptAndSaveMasterKey(
    encryptionMethod: EncryptionMethod,
    masterKey: string,
    password?: string,
  ): Promise<void>;

  getDecryptedMasterKey(masterPassword: string, intl: any): Promise<string>;

  enableEasyConfirmation(masterPassword: string, intl: any): Promise<void>;

  changePassword(
    masterPassword: string,
    newPassword: string,
    intl: any,
  ): Promise<void>;

  // =================== subscriptions =================== //

  subscribe(handler: (Wallet) => any): void;

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

  restore(data: any): Promise<void>;

  // =================== tx building =================== //

  // not exposed to wallet manager, consider removing
  getChangeAddress(): string;

  getAllUtxosForKey(utxos: Array<RawUtxo>): Promise<Array<AddressedUtxo>>;

  getAddressingInfo(address: string): any;

  asAddressedUtxo(utxos: Array<RawUtxo>): Array<AddressedUtxo>;

  // byron-era, deprecated
  prepareTransaction(
    utxos: Array<RawUtxo>,
    receiverAddress: string,
    amount: BigNumber,
  ): Promise<PreparedTransactionData>;

  // byron-era, deprecated
  legacySignTx(
    transaction: PreparedTransactionData,
    decryptedMasterKey: string,
  ): Promise<string>;

  createUnsignedTx<T>(
    utxos: Array<RawUtxo>,
    receiver: string,
    amount: string,
  ): Promise<BaseSignRequest<T>>;

  signTx<T>(
    signRequest: BaseSignRequest<T>,
    decryptedMasterKey: string,
  ): Promise<SignedTx>;

  prepareDelegationTx(
    poolData: PoolData,
    valueInAccount: number,
    utxos: Array<RawUtxo>,
  ): Promise<DelegationTxData>;

  signDelegationTx<T: V3UnsignedTxAddressedUtxoData>(
    unsignedTx: T,
    decryptedMasterKey: string,
  ): Promise<V3SignedTx>;

  // =================== backend API =================== //

  submitTransaction(signedTx: string): Promise<any>;

  getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse>;

  fetchUTXOs(): Promise<any>;

  fetchAccountState(): Promise<any>;

  fetchPoolInfo(pool: PoolInfoRequest): Promise<any>;
}
