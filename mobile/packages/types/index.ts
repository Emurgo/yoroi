import {AppApi} from './api/app'
import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from './api/cache'
import {
  ApiFtMetadata,
  ApiFtMetadataRecord,
  ApiFtRecords,
  ApiFutureToken,
  ApiFutureTokenRecords,
  ApiMetadataFile,
  ApiNftMetadata,
  ApiNftMetadataRecord,
  ApiNftRecords,
  ApiOffChainMetadataRecord,
  ApiOffChainMetadataRequest,
  ApiOffChainMetadataResponse,
  ApiOnChainMetadataRecord,
  ApiOnChainMetadataRequest,
  ApiOnChainMetadataResponse,
  ApiTokeSupplyRequest,
  ApiTokenId,
  ApiTokenIdentity,
  ApiTokenRegistryEntry,
  ApiTokenSupplyRecord,
  ApiTokenSupplyResponse,
  ApiUtxoData,
  ApiUtxoDataAsset,
  ApiUtxoDataRequest,
} from './api/cardano'
import {
  ApiErrorBadRequest,
  ApiErrorConflict,
  ApiErrorForbidden,
  ApiErrorGone,
  ApiErrorInvalidState,
  ApiErrorNetwork,
  ApiErrorNotFound,
  ApiErrorResponseMalformed,
  ApiErrorServerSide,
  ApiErrorTooEarly,
  ApiErrorTooManyRequests,
  ApiErrorUnauthorized,
  ApiErrorUnknown,
  AppErrorInvalidState,
  AppErrorLibraryFailed,
  AppErrorWrongPassword,
} from './errors'
import {ApiResponse, ApiResponseError, ApiResponseSuccess} from './api/response'
import {ApiHttpStatusCode} from './api/status-code'
import {AppCacheInfo, AppCacheRecord, AppCacheRow} from './app/cache'
import {
  AppLoggerEntry,
  AppLoggerLevel,
  AppLoggerManager,
  AppLoggerMessage,
  AppLoggerMetadata,
  AppLoggerTransporter,
  AppLoggerTransporterOptions,
} from './app/logger'
import {AppMultiStorage, AppMultiStorageOptions} from './app/multi-storage'
import {
  AppObservableMultiStorage,
  AppObservableStorage,
} from './app/observable-storage'
import {
  AppObserverManager,
  AppObserverSubscribe,
  AppSubscriber,
} from './app/observer-manager'
import {AppQueueTask, AppQueueTaskManager} from './app/queue-task-manager'
import {
  AppStorage,
  AppStorageFolderName,
  AppStorageKeyManager,
} from './app/storage'
import {
  BalanceAmount,
  BalanceAmounts,
  BalanceCardanoMetadatas,
  BalanceQuantity,
  BalanceToken,
} from './balance/token'
// Import validation functions for re-export
import * as BrandedValidation from './branded/validation'
import {ZERO_QUANTITY as ZERO_QUANTITY_CONST} from './branded/amount'
import {
  CardanoAddress,
  CardanoMetadata,
  CardanoSignedTx,
  CardanoStaking,
  CardanoTokenId,
  CardanoTxInfo,
  CardanoUnsignedTx,
  CardanoVoting,
  ChainCardanoBestBlock,
  ChainCardanoProtocolParams,
} from './chain/cardano'
import {ChainNetwork, ChainSupportedNetworks} from './chain/network'
import {
  ClaimApiClaimTokensRequestPayload,
  ClaimApiClaimTokensResponse,
} from './claim/api'
import {ClaimInfo, ClaimManager, ClaimStatus} from './claim/claim'
import {
  ClaimApiErrorsAlreadyClaimed,
  ClaimApiErrorsExpired,
  ClaimApiErrorsInvalidRequest,
  ClaimApiErrorsNotFound,
  ClaimApiErrorsRateLimited,
  ClaimApiErrorsTooEarly,
} from './errors'
import {ExchangeApi} from './exchange/api'
import {ExchangeBlockchainCode} from './exchange/blockchain'
import {ExchangeManagerOptions} from './exchange/build'
import {ExchangeCoin} from './exchange/coin'
import {
  ExchangeProviderNotFoundError,
  ExchangeUnknownError,
  ExchangeValidationError,
} from './errors'
import {ExchangeFiat} from './exchange/fiat'
import {ExchangeManager} from './exchange/manager'
import {ExchangeOrderType} from './exchange/order-type'
import {ExchangeProvider} from './exchange/provider'
import {ExchangeReferralUrlQueryStringParams} from './exchange/query-string'
import {ExplorersExplorer} from './explorers/explorer'
import {ExplorersManager} from './explorers/manager'
import {HWDeviceInfo, HWDeviceObj, HWFeatures} from './hw/hw'
import {NumberLocale} from './intl/numbers'
import {
  LinksLink,
  LinksModule,
  LinksUriConfig,
  LinksUriRules,
  LinksWebCardanoUriConfig,
} from './links/cardano'
import {
  CardanoActionBrowseDapp as CardanoActionBrowseDappType,
  CardanoActionClaim as CardanoActionClaimType,
  CardanoActionDelegateDrep as CardanoActionDelegateDrepType,
  CardanoActionLaunchUrl as CardanoActionLaunchUrlType,
  CardanoActionP2PConnect as CardanoActionP2PConnectType,
  CardanoActionPayRequest as CardanoActionPayRequestType,
  CardanoActionRestoreWallet as CardanoActionRestoreWalletType,
  CardanoActionSendOnlyReceiver as CardanoActionSendOnlyReceiverType,
  CardanoActionSendSinglePt as CardanoActionSendSinglePtType,
  CardanoActionStakePool as CardanoActionStakePoolType,
  CardanoAction as CardanoActionType,
  CardanoActionViewAddress as CardanoActionViewAddressType,
  CardanoActionViewBlock as CardanoActionViewBlockType,
  CardanoActionViewTransaction as CardanoActionViewTransactionType,
  ScanFeature,
} from './links/cardano-actions'
import {
  LinksErrorExtraParamsDenied,
  LinksErrorForbiddenParamsProvided,
  LinksErrorParamsValidationFailed,
  LinksErrorRequiredParamsMissing,
  LinksErrorSchemeNotImplemented,
  LinksErrorUnsupportedAuthority,
  LinksErrorUnsupportedVersion,
} from './errors'
import {
  LinksBrowserLaunchDappUrlParams,
  LinksExchangeShowCreateResultParams,
  LinksPartnerInfoParams,
  LinksTransferRequestAdaParams,
  LinksTransferRequestAdaWithLinkParams,
  LinksYoroiAction,
  LinksYoroiActionInfo,
  LinksYoroiModule,
  LinksYoroiUriConfig,
} from './links/yoroi'
import {
  NetworkApi,
  NetworkBlockchains,
  NetworkConfig,
  NetworkEpochInfo,
  NetworkEpochProgress,
  NetworkEraConfig,
  NetworkManager,
} from './network/manager'
import {
  BannerNotificationEvent,
  NotificationConfig,
  NotificationEvent,
  NotificationGroup,
  NotificationManager,
  NotificationManagerMakerProps,
  NotificationPrimaryTokenPriceChangedEvent,
  NotificationRewardsUpdatedEvent,
  NotificationTransactionReceivedEvent,
  NotificationTrigger,
  PushNotificationEvent,
} from './notifications/manager'
import {NumbersAtomicValue} from './numbers/atomic-value'
import {NumbersErrorInvalidAtomicValue} from './errors'
import {NumbersRatio} from './numbers/ratio'
import {
  PortfolioTokenActivity,
  PortfolioTokenActivityRecord,
  PortfolioTokenActivityWindow,
} from './portfolio/activity'
import {
  PortfolioPrimaryBreakdown,
  PortfolioTokenAmount,
  PortfolioTokenAmountRecords,
} from './portfolio/amount'
import {
  PortfolioApi,
  PortfolioApiTokenActivityResponse,
  PortfolioApiTokenDiscoveryResponse,
  PortfolioApiTokenHistoryResponse,
  PortfolioApiTokenInfosResponse,
  PortfolioApiTokenTraitsResponse,
} from './portfolio/api'
import {
  PortfolioFungibilityFilter,
  PortfolioTokenBalances,
} from './portfolio/balances'
import {
  PortfolioCurrencyConfig,
  PortfolioCurrencyConfigBySymbol,
  PortfolioCurrencySymbol,
} from './portfolio/currency'
import {PortfolioTokenDiscovery} from './portfolio/discovery'
import {
  PortfolioEventBalanceManager,
  PortfolioEventBalanceManagerHydrate,
  PortfolioEventBalanceManagerRefresh,
  PortfolioEventBalanceManagerSync,
  PortfolioEventManagerOn,
  PortfolioEventSourceId,
  PortfolioEventTokenManager,
  PortfolioEventTokenManagerHydrate,
  PortfolioEventTokenManagerSync,
} from './portfolio/event'
import {
  PortfolioTokenHistory,
  PortfolioTokenHistoryPeriod,
} from './portfolio/history'
import {PortfolioTokenInfo} from './portfolio/info'
import {
  PortfolioManagerBalance,
  PortfolioManagerToken,
} from './portfolio/manager'
import {PortfolioTokenPrice} from './portfolio/price'
import {
  PortfolioStorageBalance,
  PortfolioStorageToken,
} from './portfolio/storage'
import {
  PortfolioTokenApplication,
  PortfolioTokenId,
  PortfolioTokenNature,
  PortfolioTokenPropertyType,
  PortfolioTokenSource,
  PortfolioTokenStatus,
  PortfolioTokenType,
} from './portfolio/token'
import {PortfolioTokenTrait, PortfolioTokenTraits} from './portfolio/traits'
import {
  ResolverAddressResponse,
  ResolverAddressesResponse,
  ResolverApi,
  ResolverStrategy,
} from './resolver/api'
import {
  ResolverErrorInvalidDomain,
  ResolverErrorInvalidResponse,
  ResolverErrorNotFound,
  ResolverErrorUnsupportedTld,
  ResolverErrorWrongBlockchain,
} from './errors'
import {ResolverManager} from './resolver/manager'
import {ResolverNameServer} from './resolver/name-server'
import {ResolverReceiver} from './resolver/receiver'
import {ResolverStorage} from './resolver/storage'
import {ScanErrorUnknown, ScanErrorUnknownContent} from './errors'
import {SwapAggregator} from './swap/aggregator'
import {
  SwapApi,
  SwapCancelRequest,
  SwapCancelResponse,
  SwapCreateRequest,
  SwapCreateResponse,
  SwapEstimateRequest,
  SwapEstimateResponse,
  SwapLimitOptionsRequest,
  SwapLimitOptionsResponse,
  SwapSplit,
} from './swap/api'
import {SwapDex} from './swap/dex'
import {
  SwapManager,
  SwapManagerMaker,
  SwapManagerSettings,
} from './swap/manager'
import {SwapOrder} from './swap/order'
import {SwapProtocol} from './swap/protocol'
import {SwapStorage} from './swap/storage'
import {TransferEntry, TransferTarget, TransferTargets} from './transfer/state'
import {WalletMeta} from './wallet/meta'
import {
  BaseAsset,
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TransactionAssurance,
  TransactionDirection,
  TransactionStatus,
  TransactionToken,
  TransactionType,
  Transactions,
  TxMetadata,
  TxMetadataInfo,
  WalletTransaction,
} from './wallet/transactions'
import {
  CoSigner,
  MultisigWalletMeta,
  QuorumRuleKind,
  QuorumRules,
  WalletAddressMode,
  WalletImplementation,
} from './wallet/wallet'

// Type aliases to reference imported transaction types (avoid circular references in namespace)
type ImportedTransactionAssurance = TransactionAssurance
type ImportedWalletTransaction = WalletTransaction
type ImportedTransactions = Transactions
type ImportedTxMetadata = TxMetadata
type ImportedTxMetadataInfo = TxMetadataInfo
type ImportedBaseAsset = BaseAsset
// Type aliases for wallet types (avoid circular references in namespace)
type ImportedQuorumRuleKind = QuorumRuleKind
type ImportedQuorumRules = QuorumRules
type ImportedCoSigner = CoSigner
type ImportedMultisigWalletMeta = MultisigWalletMeta

export namespace App {
  export namespace Errors {
    export class InvalidState extends AppErrorInvalidState {}
    export class WrongPassword extends AppErrorWrongPassword {}
    export class LibraryError extends AppErrorLibraryFailed {}
  }

  /**
   * Remote configuration for Yoroi app
   */
  export type Config = Readonly<{
    pushLinkKeys?: Readonly<{
      internal?: Readonly<{
        catalystRegistration?: Readonly<{
          mobile?: string
          extension?: string
        }>
      }>
      external?: Readonly<{
        yoroiWebsite?: string
      }>
    }>
    banners?: Readonly<{
      midnightAnnouncement?: Readonly<{
        display?: boolean
      }>
      midnightPhase2Announcement?: Readonly<{
        display?: boolean
      }>
      yoroiDrep?: Readonly<{
        display?: boolean
      }>
    }>
    popups?: Readonly<{
      midnightDistribution?: Readonly<{
        display?: boolean
      }>
      generalFeaturesAnnouncement?: Readonly<{
        display?: boolean
      }>
      poolTransitionDialog?: Readonly<{
        display?: boolean
      }>
      cardanoCardAnnouncement?: Readonly<{
        display?: boolean
      }>
      firefoxSupportAnnouncement?: Readonly<{
        display?: boolean
      }>
      stakingUpdate?: Readonly<{
        display?: boolean
        affectedPools?: ReadonlyArray<string>
      }>
    }>
    features?: Readonly<{
      midnightAirdrop?: Readonly<{
        enabled: boolean
      }>
      [key: string]: unknown
    }>
    dapps?: Readonly<{
      banned?: ReadonlyArray<string>
      recommended?: ReadonlyArray<App.ConfigRecommendedDapp>
      filters?: Readonly<{
        Media?: ReadonlyArray<string>
        Investment?: ReadonlyArray<string>
        Trading?: ReadonlyArray<string>
        Community?: ReadonlyArray<string>
      }>
    }>
    swap?: Readonly<{
      initialPair?: Readonly<{
        tokenIn?: Portfolio.Token.Id
        tokenOut?: Portfolio.Token.Id
      }>
      excludedTokens?: ReadonlyArray<Portfolio.Token.Id>
      verifiedTokens?: ReadonlyArray<Portfolio.Token.Id>
      partners?: Readonly<{
        dexhunter?: string
        muesliswap?: string
        minswap?: string
        steelswap?: string
      }>
    }>
    enableTrezorAirdrop?: boolean
  }>

  /**
   * Recommended DApp configuration
   */
  export type ConfigRecommendedDapp = {
    id: string
    name: string
    description: string
    category: string
    logo: string
    uri: string
    origins: ReadonlyArray<string>
    isSingleAddress?: boolean
  }

  export interface Storage<
    IsAsync extends boolean = true,
    K extends string = string,
  > extends AppStorage<IsAsync, K> {}
  export type StorageKeyManager<
    T = unknown,
    R = T,
    Key extends string = string,
  > = AppStorageKeyManager<T, R, Key>
  export type StorageFolderName = AppStorageFolderName
  export interface MultiStorage<
    T,
    IsAsync extends boolean = true,
    K extends string = string,
  > extends AppMultiStorage<T, IsAsync, K> {}

  export interface ObservableStorage<
    IsAsync extends boolean = true,
    K extends string = string,
  > extends AppObservableStorage<IsAsync, K> {}
  export interface ObservableMultiStorage<
    T,
    IsAsync extends boolean = true,
    K extends string = string,
  > extends AppObservableMultiStorage<T, IsAsync, K> {}

  export type MultiStorageOptions<
    T,
    IsAsync extends boolean = true,
    K extends string = string,
  > = AppMultiStorageOptions<T, IsAsync, K>

  export type ObserverManager<T> = AppObserverManager<T>
  export type Subscriber<T> = AppSubscriber<T>
  export type ObserverSubscribe<T> = AppObserverSubscribe<T>

  export type QueueTask = AppQueueTask
  export type QueueTaskManager = AppQueueTaskManager

  export type CacheInfo = AppCacheInfo
  export interface CacheRecord<T> extends AppCacheRecord<T> {}
  export interface CacheRow<T, K extends string = string>
    extends AppCacheRow<T, K> {}

  export interface Api extends AppApi {}

  export namespace Logger {
    export type Level = AppLoggerLevel
    export const Level = AppLoggerLevel
    export type Message = AppLoggerMessage
    export type Metadata = AppLoggerMetadata
    export type Transporter = AppLoggerTransporter
    export type TransporterOptions = AppLoggerTransporterOptions
    export type Entry = AppLoggerEntry
    export type Manager = AppLoggerManager
  }
}

export namespace Swap {
  export type Api = SwapApi
  export type Order = SwapOrder
  export type Aggregator = SwapAggregator
  export const Aggregator = SwapAggregator
  export type Protocol = SwapProtocol
  export const Protocol = SwapProtocol
  export type Dex = SwapDex
  export const Dex = SwapDex
  export type LimitOptionsRequest = SwapLimitOptionsRequest
  export type LimitOptionsResponse = SwapLimitOptionsResponse
  export type CancelRequest = SwapCancelRequest
  export type CancelResponse = SwapCancelResponse
  export type EstimateRequest = SwapEstimateRequest
  export type EstimateResponse = SwapEstimateResponse
  export type CreateRequest = SwapCreateRequest
  export type CreateResponse = SwapCreateResponse
  export type Split = SwapSplit
  export type Storage = SwapStorage
  export type Manager = SwapManager
  export type ManagerMaker = SwapManagerMaker
  export type ManagerSettings = SwapManagerSettings
}

export namespace Balance {
  export type Token = BalanceToken
  export type TokenInfo = BalanceToken['info']
  export type TokenPrice = BalanceToken['price']
  export type TokenSupply = BalanceToken['supply']
  export type TokenStatus = BalanceToken['status']

  export type CardanoMetadatas = BalanceCardanoMetadatas

  export type Quantity = BalanceQuantity
  export type Amount = BalanceAmount
  export type Amounts = BalanceAmounts
}

// Re-export branded types
export type {
  Address,
  AddressBase58,
  AddressBech32,
  AddressHex,
  Amount,
  AmountFormatted,
  AmountRaw,
  AmountSanitized,
  AnchorHash,
  AnchorUrl,
  AssetName,
  AssetNameUtf8,
  BalanceQuantity,
  Blake2bHash,
  BlockHash,
  CborHex,
  CborHexValidated,
  DRepId,
  DatumCbor,
  DatumHash,
  EpochNumber,
  GovernanceActionId,
  KeyHash,
  Lovelace,
  MetadataCbor,
  PaymentAddress,
  PolicyId,
  PortfolioTokenId,
  PrivateKeyBech32,
  PrivateKeyHex,
  PublicKeyHex,
  Bip32PublicKeyHex,
  ScriptCbor,
  ScriptHash,
  Sha256Hash,
  SignatureHex,
  SlotNumber,
  StakingAddress,
  TokenFingerprint,
  TokenId,
  TransactionCbor,
  TransactionCborHex,
  TransactionCborBase64,
  TransactionHash,
  TransactionId,
  UtxoId,
} from './branded'

// Type aliases for Wallet namespace exports (avoid circular references)
// Imported types from './branded' are used directly

export namespace Branded {
  // Re-export validation functions
  export const asAddress = BrandedValidation.asAddress
  export const asAddressBech32 = BrandedValidation.asAddressBech32
  export const asAddressHex = BrandedValidation.asAddressHex
  export const asAddressBase58 = BrandedValidation.asAddressBase58
  export const asPaymentAddress = BrandedValidation.asPaymentAddress
  export const asStakingAddress = BrandedValidation.asStakingAddress
  export const addressToBech32 = BrandedValidation.addressToBech32
  export const addressToHex = BrandedValidation.addressToHex
  export const addressToBase58 = BrandedValidation.addressToBase58
  export const bech32ToAddress = BrandedValidation.bech32ToAddress
  export const hexToAddress = BrandedValidation.hexToAddress
  export const base58ToAddress = BrandedValidation.base58ToAddress
  export const addressToPayment = BrandedValidation.addressToPayment
  export const addressToStaking = BrandedValidation.addressToStaking
  export const paymentToAddress = BrandedValidation.paymentToAddress
  export const stakingToAddress = BrandedValidation.stakingToAddress
  export const asTokenId = BrandedValidation.asTokenId
  export const asPortfolioTokenId = BrandedValidation.asPortfolioTokenId
  export const asPolicyId = BrandedValidation.asPolicyId
  export const asAssetName = BrandedValidation.asAssetName
  export const asTokenFingerprint = BrandedValidation.asTokenFingerprint
  export const asAmount = BrandedValidation.asAmount
  export const asAmountRaw = BrandedValidation.asAmountRaw
  export const asAmountSanitized = BrandedValidation.asAmountSanitized
  export const asAmountFormatted = BrandedValidation.asAmountFormatted
  export const asBalanceQuantity = BrandedValidation.asBalanceQuantity
  export const asTransactionHash = BrandedValidation.asTransactionHash
  export const asUtxoId = BrandedValidation.asUtxoId
  export const asUtxoIdFromParts = BrandedValidation.asUtxoIdFromParts
  export const asBlockHash = BrandedValidation.asBlockHash
  export const asSlotNumber = BrandedValidation.asSlotNumber
  export const asEpochNumber = BrandedValidation.asEpochNumber
  export const asPublicKeyHex = BrandedValidation.asPublicKeyHex
  export const asPrivateKeyHex = BrandedValidation.asPrivateKeyHex
  export const asKeyHash = BrandedValidation.asKeyHash
  export const asSignatureHex = BrandedValidation.asSignatureHex
  export const asBlake2bHash = BrandedValidation.asBlake2bHash
  export const asSha256Hash = BrandedValidation.asSha256Hash
  export const asDatumHash = BrandedValidation.asDatumHash
  export const asScriptHash = BrandedValidation.asScriptHash
  export const asCborHex = BrandedValidation.asCborHex
  export const asMetadataCbor = BrandedValidation.asMetadataCbor
  export const asScriptCbor = BrandedValidation.asScriptCbor
  export const asDatumCbor = BrandedValidation.asDatumCbor
  export const asTransactionCbor = BrandedValidation.asTransactionCbor
  export const asTransactionCborHex = BrandedValidation.asTransactionCborHex
  export const asTransactionCborBase64 = BrandedValidation.asTransactionCborBase64
  export const asDRepId = BrandedValidation.asDRepId
  export const asGovernanceActionId = BrandedValidation.asGovernanceActionId
  export const asAnchorUrl = BrandedValidation.asAnchorUrl
  export const asAnchorHash = BrandedValidation.asAnchorHash
  
  // Re-export constants
  export const ZERO_QUANTITY = ZERO_QUANTITY_CONST
}

// Also export ZERO_QUANTITY at top level for convenience
export {ZERO_QUANTITY} from './branded/amount'

export namespace Links {
  export type YoroiModule = LinksYoroiModule
  export interface UriConfig extends LinksUriConfig {}
  export interface WebCardanoUriConfig extends LinksWebCardanoUriConfig {}
  export interface YoroiUriConfig extends LinksYoroiUriConfig {}
  export type PartnerInfoSchema = LinksPartnerInfoParams
  export type ExchangeShowCreateResultParams =
    LinksExchangeShowCreateResultParams
  export type TransferRequestAdaWithLinkParams =
    LinksTransferRequestAdaWithLinkParams
  export type TransferRequestAdaParams = LinksTransferRequestAdaParams
  export type BrowserLaunchDappUrlParams = LinksBrowserLaunchDappUrlParams
  export type YoroiActionInfo = LinksYoroiActionInfo
  export type YoroiAction = LinksYoroiAction

  export interface Rules extends LinksUriRules {}

  export type Link<T extends LinksUriConfig> = LinksLink<T>

  export type Module<T extends LinksUriConfig> = LinksModule<T>

  // Cardano link actions (multichain-ready: future BitcoinAction, EthereumAction, etc.)
  export namespace CardanoAction {
    export type Action = CardanoActionType
    export type Claim = CardanoActionClaimType
    export type SendOnlyReceiver = CardanoActionSendOnlyReceiverType
    export type SendSinglePt = CardanoActionSendSinglePtType
    export type LaunchUrl = CardanoActionLaunchUrlType
    export type BrowseDapp = CardanoActionBrowseDappType
    export type PayRequest = CardanoActionPayRequestType
    export type StakePool = CardanoActionStakePoolType
    export type DelegateDrep = CardanoActionDelegateDrepType
    export type ViewTransaction = CardanoActionViewTransactionType
    export type ViewBlock = CardanoActionViewBlockType
    export type ViewAddress = CardanoActionViewAddressType
    export type P2PConnect = CardanoActionP2PConnectType
    export type RestoreWallet = CardanoActionRestoreWalletType
  }
  export type CardanoAction = CardanoActionType
  export type CardanoActionClaim = CardanoActionClaimType
  export type CardanoActionSendOnlyReceiver = CardanoActionSendOnlyReceiverType
  export type CardanoActionSendSinglePt = CardanoActionSendSinglePtType
  export type CardanoActionLaunchUrl = CardanoActionLaunchUrlType
  export type CardanoActionBrowseDapp = CardanoActionBrowseDappType
  export type CardanoActionPayRequest = CardanoActionPayRequestType
  export type CardanoActionStakePool = CardanoActionStakePoolType
  export type CardanoActionDelegateDrep = CardanoActionDelegateDrepType
  export type CardanoActionViewTransaction = CardanoActionViewTransactionType
  export type CardanoActionViewBlock = CardanoActionViewBlockType
  export type CardanoActionViewAddress = CardanoActionViewAddressType
  export type CardanoActionP2PConnect = CardanoActionP2PConnectType
  export type CardanoActionRestoreWallet = CardanoActionRestoreWalletType

  export namespace Errors {
    export class ExtraParamsDenied extends LinksErrorExtraParamsDenied {
      constructor(message?: string) {
        super(message)
      }
    }
    export class ForbiddenParamsProvided extends LinksErrorForbiddenParamsProvided {
      constructor(message?: string) {
        super(message)
      }
    }
    export class RequiredParamsMissing extends LinksErrorRequiredParamsMissing {
      constructor(message?: string) {
        super(message)
      }
    }
    export class ParamsValidationFailed extends LinksErrorParamsValidationFailed {
      constructor(message?: string) {
        super(message)
      }
    }
    export class UnknownContent extends ScanErrorUnknownContent {}
    export class UnsupportedAuthority extends LinksErrorUnsupportedAuthority {
      constructor(message?: string) {
        super(message)
      }
    }
    export class UnsupportedVersion extends LinksErrorUnsupportedVersion {
      constructor(message?: string) {
        super(message)
      }
    }
    export class SchemeNotImplemented extends LinksErrorSchemeNotImplemented {
      constructor(message?: string) {
        super(message)
      }
    }
  }
}

export namespace Api {
  export type ResponseError = ApiResponseError
  export type ResponseSuccess<T> = ApiResponseSuccess<T>
  export type Response<T> = ApiResponse<T>

  export type ResponseWithCache<T> = ApiResponseRecordWithCache<T>
  export type RequestWithCache<T> = ApiRequestRecordWithCache<T>
  export type HttpStatusCode = ApiHttpStatusCode
  export const HttpStatusCode = ApiHttpStatusCode

  export namespace Errors {
    export class BadRequest extends ApiErrorBadRequest {}
    export class NotFound extends ApiErrorNotFound {}
    export class Conflict extends ApiErrorConflict {}
    export class Forbidden extends ApiErrorForbidden {}
    export class Gone extends ApiErrorGone {}
    export class TooEarly extends ApiErrorTooEarly {}
    export class TooManyRequests extends ApiErrorTooManyRequests {}
    export class Unauthorized extends ApiErrorUnauthorized {}
    export class ServerSide extends ApiErrorServerSide {}
    export class Network extends ApiErrorNetwork {}
    export class Unknown extends ApiErrorUnknown {}
    export class InvalidState extends ApiErrorInvalidState {}

    export class ResponseMalformed extends ApiErrorResponseMalformed {}
  }

  export namespace Cardano {
    export type OffChainMetadataRequest = ApiOffChainMetadataRequest
    export type OnChainMetadataRecord = ApiOnChainMetadataRecord
    export type OffChainMetadataResponse = ApiOffChainMetadataResponse

    export type OnChainMetadataRequest = ApiOnChainMetadataRequest
    export type OffChainMetadataRecord = ApiOffChainMetadataRecord
    export type OnChainMetadataResponse = ApiOnChainMetadataResponse

    export type TokenSupplyRequest = ApiTokeSupplyRequest
    export type TokenSupplyRecord = ApiTokenSupplyRecord

    export type TokenIdentity = ApiTokenIdentity
    export type TokenSupplyResponse = ApiTokenSupplyResponse

    export type FutureToken = ApiFutureToken
    export type FutureTokenRecords = ApiFutureTokenRecords

    export type FtMetadata = ApiFtMetadata
    export type FtMetadataRecord = ApiFtMetadataRecord
    export interface FtRecords extends ApiFtRecords {}
    export type TokenRegistryEntry = ApiTokenRegistryEntry

    export type NftMetadata = ApiNftMetadata
    export type NftMetadataRecord = ApiNftMetadataRecord
    export interface NftRecords extends ApiNftRecords {}

    export type MetadataFile = ApiMetadataFile
    export type TokenId = ApiTokenId

    export type ProtocolParams = ChainCardanoProtocolParams
    export type BestBlock = ChainCardanoBestBlock

    export type UtxoDataRequest = ApiUtxoDataRequest
    export type UtxoDataAsset = ApiUtxoDataAsset
    export type UtxoData = ApiUtxoData

    export interface Api {
      getProtocolParams: () => Promise<ChainCardanoProtocolParams>
      getBestBlock: () => Promise<ChainCardanoBestBlock>
      getUtxoData: (request: UtxoDataRequest) => Promise<ApiUtxoData>
    }
  }
}

export namespace Numbers {
  export type Locale = NumberLocale
  export type AtomicValue = NumbersAtomicValue
  export type Ratio = NumbersRatio

  export namespace Errors {
    export class InvalidAtomicValue extends NumbersErrorInvalidAtomicValue {}
  }
}

export namespace Resolver {
  export interface Api extends ResolverApi {}
  export type Manager = ResolverManager

  export type NameServer = ResolverNameServer
  export const NameServer = ResolverNameServer
  export type Receiver = ResolverReceiver

  export type AddressResponse = ResolverAddressResponse
  export type AddressesResponse = ResolverAddressesResponse

  export type Strategy = ResolverStrategy

  export type Storage = ResolverStorage

  export namespace Errors {
    export class InvalidResponse extends ResolverErrorInvalidResponse {}
    export class InvalidDomain extends ResolverErrorInvalidDomain {}
    export class NotFound extends ResolverErrorNotFound {}
    export class UnsupportedTld extends ResolverErrorUnsupportedTld {}
    export class Expired extends ResolverErrorUnsupportedTld {}
    export class WrongBlockchain extends ResolverErrorWrongBlockchain {}
  }
}

export namespace Transfer {
  export type Entry = TransferEntry
  export type Target = TransferTarget
  export type Targets = TransferTargets
}

export namespace Explorers {
  export type Manager = ExplorersManager
  export const Explorer = ExplorersExplorer
  export type Explorer = ExplorersExplorer
}

export namespace Portfolio {
  export type PrimaryBreakdown = PortfolioPrimaryBreakdown
  export type FungibilityFilter = PortfolioFungibilityFilter

  export namespace Currency {
    export type Symbol = PortfolioCurrencySymbol
    export type Config = PortfolioCurrencyConfig
    export type ConfigBySymbol = PortfolioCurrencyConfigBySymbol
  }

  export namespace Event {
    export type SourceId = PortfolioEventSourceId
    export type TokenManager = PortfolioEventTokenManager
    export type BalanceManager = PortfolioEventBalanceManager
    export type ManagerOn = PortfolioEventManagerOn
    export const ManagerOn = PortfolioEventManagerOn

    export type TokenManagerSync = PortfolioEventTokenManagerSync
    export type TokenManagerHydrate = PortfolioEventTokenManagerHydrate

    export type BalanceManagerSync = PortfolioEventBalanceManagerSync
    export type BalanceManagerHydrate = PortfolioEventBalanceManagerHydrate
    export type BalanceManagerRefresh = PortfolioEventBalanceManagerRefresh
  }

  export namespace Api {
    export type TokenInfosResponse = PortfolioApiTokenInfosResponse
    export type TokenDiscoveryResponse = PortfolioApiTokenDiscoveryResponse
    export type TokenTraitsResponse = PortfolioApiTokenTraitsResponse
    export type TokenActivityResponse = PortfolioApiTokenActivityResponse
    export type TokenHistoryResponse = PortfolioApiTokenHistoryResponse
    export type Api = PortfolioApi
  }

  export namespace Storage {
    export type Token = PortfolioStorageToken
    export type Balance = PortfolioStorageBalance
  }

  export namespace Manager {
    export type Token = PortfolioManagerToken
    export type Balance = PortfolioManagerBalance
  }

  export namespace Token {
    export type Trait = PortfolioTokenTrait
    export type Traits = PortfolioTokenTraits
    export type Balances = PortfolioTokenBalances
    export type Amount = PortfolioTokenAmount
    export type AmountRecords = PortfolioTokenAmountRecords

    export type Id = PortfolioTokenId

    export type Type = PortfolioTokenType
    export const Type = PortfolioTokenType

    export type PropertyType = PortfolioTokenPropertyType
    export const PropertyType = PortfolioTokenPropertyType

    export type Application = PortfolioTokenApplication
    export const Application = PortfolioTokenApplication

    export type Source = PortfolioTokenSource
    export const Source = PortfolioTokenSource

    export type Nature = PortfolioTokenNature
    export const Nature = PortfolioTokenNature

    export type Status = PortfolioTokenStatus
    export const Status = PortfolioTokenStatus

    export type Info = PortfolioTokenInfo
    export type Discovery = PortfolioTokenDiscovery
    export type Price = PortfolioTokenPrice

    export type Activity = PortfolioTokenActivity
    export type ActivityWindow = PortfolioTokenActivityWindow
    export const ActivityWindow = PortfolioTokenActivityWindow
    export type ActivityRecord = PortfolioTokenActivityRecord

    export type History = PortfolioTokenHistory
    export type HistoryPeriod = PortfolioTokenHistoryPeriod
    export const HistoryPeriod = PortfolioTokenHistoryPeriod
  }
}

export namespace Chain {
  export type Network = ChainNetwork
  export const Network = ChainNetwork
  export type SupportedNetworks = ChainSupportedNetworks

  export namespace Cardano {
    export type UnsignedTx = CardanoUnsignedTx
    export type SignedTx = CardanoSignedTx
    export type TxInfo = CardanoTxInfo
    export type Metadata = CardanoMetadata
    export type Staking = CardanoStaking
    export type Voting = CardanoVoting
    export type Address = CardanoAddress
    export type TokenId = CardanoTokenId
    export type ProtocolParams = ChainCardanoProtocolParams
    export type BestBlock = ChainCardanoBestBlock
  }
}

export namespace HW {
  export type Features = HWFeatures
  export type DeviceInfo = HWDeviceInfo
  export type DeviceObj = HWDeviceObj
}

export namespace Wallet {
  export type Implementation = WalletImplementation
  export type AddressMode = WalletAddressMode
  export type Meta = WalletMeta
  export type QuorumRuleKind = ImportedQuorumRuleKind
  export type QuorumRules = ImportedQuorumRules
  export type CoSigner = ImportedCoSigner
  export type MultisigWalletMeta = ImportedMultisigWalletMeta
  // Branded types - these are imported from './branded' at top level (lines 569-578)
  // Use type imports to reference them within the namespace
  export type Bip32PublicKeyHex = import('./branded/crypto').Bip32PublicKeyHex
  export type ScriptCbor = import('./branded/cbor').ScriptCbor
  export type TransactionCbor = import('./branded/cbor').TransactionCbor
  export type TransactionCborHex = import('./branded/cbor').TransactionCborHex

  // Transaction types - use imported types directly to avoid circular references
  export const TransactionStatus = TRANSACTION_STATUS
  export type TransactionStatus =
    (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]
  export const TransactionDirection = TRANSACTION_DIRECTION
  export type TransactionDirection =
    (typeof TRANSACTION_DIRECTION)[keyof typeof TRANSACTION_DIRECTION]
  export const TransactionType = TRANSACTION_TYPE
  export type TransactionType =
    (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]
  // Reference imported types via intermediate aliases to avoid circular references
  export type TransactionAssurance = ImportedTransactionAssurance
  export type WalletTransaction = ImportedWalletTransaction
  export type Transactions = ImportedTransactions
  export type TxMetadata = ImportedTxMetadata
  export type TxMetadataInfo = ImportedTxMetadataInfo
  export type BaseAsset = ImportedBaseAsset
}

// Re-export BaseAsset at top level
export type {BaseAsset} from './wallet/transactions'

// Re-export transaction types at top level for convenience
export {TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE}
export type {
  TransactionAssurance,
  TransactionDirection,
  TransactionStatus,
  TransactionToken,
  TransactionType,
  Transactions,
  TxMetadata,
  TxMetadataInfo,
  WalletTransaction,
}
export type {TransactionInfo} from './wallet/transactions'

export namespace Exchange {
  export type BlockchainCode = ExchangeBlockchainCode
  export type Manager = ExchangeManager
  export type ManagerOptions = ExchangeManagerOptions
  export type Coin = ExchangeCoin
  export type Fiat = ExchangeFiat
  export type OrderType = ExchangeOrderType
  export type Provider = ExchangeProvider
  export type ReferralUrlQueryStringParams =
    ExchangeReferralUrlQueryStringParams
  export interface Api extends ExchangeApi {}
  export namespace Errors {
    export class Validation extends ExchangeValidationError {
      constructor(message?: string) {
        super(message)
      }
    }
    export class Unknown extends ExchangeUnknownError {
      constructor(message?: string) {
        super(message)
      }
    }
    export class ProviderNotFound extends ExchangeProviderNotFoundError {
      constructor(message?: string) {
        super(message)
      }
    }
  }
}

export namespace Network {
  export type Api = NetworkApi
  export type Manager = NetworkManager
  export type Config = NetworkConfig
  export type Blockchains = NetworkBlockchains
  export const Blockchains = NetworkBlockchains
  export type EraConfig = NetworkEraConfig
  export type EpochInfo = NetworkEpochInfo
  export type EpochProgress = NetworkEpochProgress
}

export namespace Notifications {
  export type Config = NotificationConfig
  export type Event = NotificationEvent
  export type Group = NotificationGroup
  export type Manager = NotificationManager
  export type ManagerMakerProps = NotificationManagerMakerProps
  export type TransactionReceivedEvent = NotificationTransactionReceivedEvent
  export type RewardsUpdatedEvent = NotificationRewardsUpdatedEvent
  export type PushEvent = PushNotificationEvent
  export type BannerEvent = BannerNotificationEvent
  export type PrimaryTokenPriceChangedEvent =
    NotificationPrimaryTokenPriceChangedEvent
  export const Trigger = NotificationTrigger
  export type Trigger = NotificationTrigger
}

export namespace Scan {
  export namespace Errors {
    export class Unknown extends ScanErrorUnknown {}
    export class UnknownContent extends ScanErrorUnknownContent {}
  }

  export type Feature = ScanFeature
}

export namespace Claim {
  export namespace Api {
    export namespace Errors {
      export class AlreadyClaimed extends ClaimApiErrorsAlreadyClaimed {
        static readonly statusCode = ClaimApiErrorsAlreadyClaimed.statusCode
      }
      export class Expired extends ClaimApiErrorsExpired {
        static readonly statusCode = ClaimApiErrorsExpired.statusCode
      }
      export class InvalidRequest extends ClaimApiErrorsInvalidRequest {
        static readonly statusCode = ClaimApiErrorsInvalidRequest.statusCode
      }
      export class NotFound extends ClaimApiErrorsNotFound {
        static readonly statusCode = ClaimApiErrorsNotFound.statusCode
      }
      export class RateLimited extends ClaimApiErrorsRateLimited {
        static readonly statusCode = ClaimApiErrorsRateLimited.statusCode
      }
      export class TooEarly extends ClaimApiErrorsTooEarly {
        static readonly statusCode = ClaimApiErrorsTooEarly.statusCode
      }
    }

    export type ClaimTokensRequestPayload = ClaimApiClaimTokensRequestPayload
    export type ClaimTokensResponse = ClaimApiClaimTokensResponse
  }

  export type Status = ClaimStatus
  export type Info = ClaimInfo
  export type Manager = ClaimManager
}

export * from './api/cardano'
export * from './helpers/storage'
export * from './helpers/types'
// Export AppLoggerLevel directly to avoid circular dependency issues
export {AppLoggerLevel} from './app/logger'
// Export all errors from centralized location
export * from './errors'
