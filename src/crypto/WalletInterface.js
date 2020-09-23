// @flow

// TODO(v-almonacid): transactionCache should be decoupled from this class.
// Use an interface instead

import {BigNumber} from 'bignumber.js'

import {AddressChain} from './chain'
import {TransactionCache} from './shelley/transactionCache'
import Wallet from './Wallet'
import {ISignRequest} from './ISignRequest'

import type {RawUtxo, TxBodiesRequest, TxBodiesResponse} from '../api/types'
import type {
  AddressedUtxo,
  BaseSignRequest,
  EncryptionMethod,
  SignedTx,
  WalletState,
} from './types'
import type {HWDeviceInfo} from './shelley/ledgerUtils'
import type {DelegationStatus} from './shelley/delegationUtils'
import type {NetworkId, WalletImplementationId} from '../config/types'
import type {Dict, WalletMeta} from '../state'
import type {Transaction} from '../types/HistoryTransaction'
import type {Addresses} from './chain'
import type {WalletChecksum} from '@emurgo/cip4-js'

export interface WalletInterface {
  id: string;

  networkId: NetworkId;

  walletImplementationId: WalletImplementationId;

  isHW: boolean;

  hwDeviceInfo: ?HWDeviceInfo;

  isEasyConfirmationEnabled: boolean;

  internalChain: AddressChain;

  externalChain: AddressChain;

  // note: currently not exposed to redux's state
  publicKeyHex: string;

  // chimeric account address (depreacted)
  chimericAccountAddress: ?string;

  // last known version the wallet has been created/restored
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
    amount: ?string,
    sendAll: boolean,
  ): Promise<ISignRequest<T>>;

  signTx<T>(
    signRequest: BaseSignRequest<T>,
    decryptedMasterKey: string,
  ): Promise<SignedTx>;

  createDelegationTx<T>(
    poolRequest: void | string,
    valueInAccount: BigNumber,
    utxos: Array<RawUtxo>,
  ): Promise<{
    signTxRequest: ISignRequest<T>,
    totalAmountToDelegate: BigNumber,
  }>;

  signDelegationTx<T>(
    signRequest: BaseSignRequest<T>,
    decryptedMasterKey: string,
  ): Promise<SignedTx>;

  signTxWithLedger<T>(
    request: ISignRequest<T>,
    useUSB: boolean,
  ): Promise<SignedTx>;

  // =================== backend API =================== //

  submitTransaction(signedTx: string): Promise<any>;

  getTxsBodiesForUTXOs(request: TxBodiesRequest): Promise<TxBodiesResponse>;

  fetchUTXOs(): Promise<any>;

  fetchAccountState(): Promise<any>;

  fetchPoolInfo(request: any): Promise<any>;
}
