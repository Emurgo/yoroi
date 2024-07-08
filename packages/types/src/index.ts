import {
  BalanceAmount,
  BalanceAmounts,
  BalanceCardanoMetadatas,
  BalanceQuantity,
  BalanceToken,
} from './balance/token'
import {SwapApi} from './swap/api'
import {SwapProtocol} from './swap/protocol'
import {
  SwapCancelOrderData,
  SwapCompletedOrder,
  SwapCreateOrderData,
  SwapCreateOrderResponse,
  SwapOpenOrder,
  SwapOrderType,
} from './swap/order'
import {SwapPool, SwapPoolProvider, SwapSupportedProvider} from './swap/pool'
import {SwapStorage} from './swap/storage'
import {SwapManager} from './swap/manager'
import {AppStorage, AppStorageFolderName} from './app/storage'
import {AppMultiStorage, AppMultiStorageOptions} from './app/multi-storage'
import {NumberLocale} from './intl/numbers'
import {SwapAggregator} from './swap/aggregator'
import {
  ResolverAddressResponse,
  ResolverAddressesResponse,
  ResolverApi,
  ResolverStrategy,
} from './resolver/api'
import {ResolverManager} from './resolver/manager'
import {ResolverReceiver} from './resolver/receiver'
import {ResolverStorage} from './resolver/storage'
import {
  LinksLink,
  LinksModule,
  LinksUriConfig,
  LinksUriRules,
  LinksWebCardanoUriConfig,
} from './links/cardano'
import {
  LinksErrorExtraParamsDenied,
  LinksErrorForbiddenParamsProvided,
  LinksErrorParamsValidationFailed,
  LinksErrorRequiredParamsMissing,
  LinksErrorSchemeNotImplemented,
  LinksErrorUnsupportedAuthority,
  LinksErrorUnsupportedVersion,
} from './links/errors'
import {
  ApiRequestRecordWithCache,
  ApiResponseRecordWithCache,
} from './api/cache'
import {ApiHttpStatusCode} from './api/status-code'
import {ApiResponse, ApiResponseError, ApiResponseSuccess} from './api/response'
import {
  ApiErrorBadRequest,
  ApiErrorNotFound,
  ApiErrorConflict,
  ApiErrorForbidden,
  ApiErrorGone,
  ApiErrorTooEarly,
  ApiErrorTooManyRequests,
  ApiErrorUnauthorized,
  ApiErrorNetwork,
  ApiErrorUnknown,
  ApiErrorServerSide,
  ApiErrorInvalidState,
  ApiErrorResponseMalformed,
} from './api/errors'
import {ResolverNameServer} from './resolver/name-server'
import {
  ResolverErrorWrongBlockchain,
  ResolverErrorInvalidDomain,
  ResolverErrorInvalidResponse,
  ResolverErrorNotFound,
  ResolverErrorUnsupportedTld,
} from './resolver/errors'
import {AppApi, AppFrontendFeeTier, AppFrontendFeesResponse} from './api/app'
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
  ApiProtocolParams,
  ApiTokenId,
  ApiTokenIdentity,
  ApiTokenRegistryEntry,
  ApiTokenSupplyRecord,
  ApiTokenSupplyResponse,
  ApiTokeSupplyRequest,
} from './api/cardano'
import {TransferEntry, TransferTarget, TransferTargets} from './transfer/state'
import {
  AppObservableMultiStorage,
  AppObservableStorage,
} from './app/observable-storage'
import {AppCacheInfo, AppCacheRecord, AppCacheRow} from './app/cache'
import {
  AppObserverManager,
  AppObserverSubscribe,
  AppSubscriber,
} from './app/observer-manager'
import {
  CardanoAddress,
  CardanoMetadata,
  CardanoSignedTx,
  CardanoStaking,
  CardanoTokenId,
  CardanoTxInfo,
  CardanoUnsignedTx,
  CardanoVoting,
} from './chain/cardano'
import {ExchangeBlockchainCode} from './exchange/blockchain'
import {ExchangeManagerOptions} from './exchange/build'
import {ExchangeCoin} from './exchange/coin'
import {ExchangeFiat} from './exchange/fiat'
import {ExchangeReferralUrlQueryStringParams} from './exchange/query-string'
import {
  ExchangeProviderNotFoundError,
  ExchangeUnknownError,
  ExchangeValidationError,
} from './exchange/errors'
import {ExchangeOrderType} from './exchange/order-type'
import {ExchangeProvider} from './exchange/provider'
import {ExchangeApi} from './exchange/api'
import {ExchangeManager} from './exchange/manager'
import {
  LinksPartnerInfoParams,
  LinksExchangeShowCreateResultParams,
  LinksTransferRequestAdaWithLinkParams,
  LinksTransferRequestAdaParams,
  LinksYoroiActionInfo,
  LinksYoroiAction,
  LinksYoroiUriConfig,
  LinksYoroiModule,
} from './links/yoroi'
import {
  PortfolioTokenId,
  PortfolioTokenType,
  PortfolioTokenPropertyType,
  PortfolioTokenApplication,
  PortfolioTokenSource,
  PortfolioTokenNature,
  PortfolioTokenStatus,
} from './portfolio/token'
import {PortfolioTokenDiscovery} from './portfolio/discovery'
import {PortfolioTokenInfo} from './portfolio/info'
import {
  PortfolioTokenAmount,
  PortfolioTokenAmountRecords,
  PortfolioPrimaryBreakdown,
  PortfolioSimpleAmount,
} from './portfolio/amount'
import {PortfolioTokenPrice} from './portfolio/price'
import {ChainNetwork, ChainSupportedNetworks} from './chain/network'
import {NumbersErrorInvalidAtomicValue} from './numbers/errors'
import {NumbersAtomicValue} from './numbers/atomic-value'
import {
  AppErrorInvalidState,
  AppErrorWrongPassword,
  AppErrorLibraryFailed,
} from './app/errors'
import {
  PortfolioApi,
  PortfolioApiTokenDiscoveryResponse,
  PortfolioApiTokenInfosResponse,
  PortfolioApiTokenTraitsResponse,
} from './portfolio/api'
import {
  PortfolioEventBalanceManager,
  PortfolioEventSourceId,
  PortfolioEventManagerOn,
  PortfolioEventTokenManager,
  PortfolioEventTokenManagerSync,
  PortfolioEventTokenManagerHydrate,
  PortfolioEventBalanceManagerHydrate,
  PortfolioEventBalanceManagerRefresh,
  PortfolioEventBalanceManagerSync,
} from './portfolio/event'
import {
  PortfolioStorageBalance,
  PortfolioStorageToken,
} from './portfolio/storage'
import {
  PortfolioManagerBalance,
  PortfolioManagerToken,
} from './portfolio/manager'
import {
  PortfolioFungibilityFilter,
  PortfolioTokenBalances,
} from './portfolio/balances'
import {AppQueueTask, AppQueueTaskManager} from './app/queue-task-manager'
import {ExplorersManager} from './explorers/manager'
import {ExplorersExplorer} from './explorers/explorer'
import {PortfolioTokenTraits} from './portfolio/traits'
import {HWDeviceInfo, HWDeviceObj, HWFeatures} from './hw/hw'
import {WalletAddressMode, WalletImplementation} from './wallet/wallet'
import {WalletMeta} from './wallet/meta'
import {
  NetworkApi,
  NetworkConfig,
  NetworkEpochInfo,
  NetworkEpochProgress,
  NetworkEraConfig,
  NetworkManager,
} from './network/manager'

export namespace App {
  export namespace Errors {
    export class InvalidState extends AppErrorInvalidState {}
    export class WrongPassword extends AppErrorWrongPassword {}
    export class LibraryError extends AppErrorLibraryFailed {}
  }

  export interface Storage<
    IsAsync extends boolean = true,
    K extends string = string,
  > extends AppStorage<IsAsync, K> {}
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

  export type FrontendFeeTier = AppFrontendFeeTier
  export type FrontendFeesResponse = AppFrontendFeesResponse
}

export namespace Swap {
  export interface Api extends SwapApi {}
  export type Manager = SwapManager

  export type OpenOrder = SwapOpenOrder
  export type CompletedOrder = SwapCompletedOrder
  export type CreateOrderData = SwapCreateOrderData
  export type CancelOrderData = SwapCancelOrderData
  export type Order = SwapOpenOrder | SwapCompletedOrder
  export type CreateOrderResponse = SwapCreateOrderResponse
  export type OpenOrderResponse = SwapOpenOrder[]
  export type CompletedOrderResponse = SwapCompletedOrder[]
  export type OrderType = SwapOrderType

  export type Protocol = SwapProtocol

  export type Aggregator = SwapAggregator

  export type Pool = SwapPool
  export type PoolResponse = SwapPool[]
  export type PoolProvider = SwapPoolProvider
  export type SupportedProvider = SwapSupportedProvider

  export type Storage = SwapStorage
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
  export type YoroiActionInfo = LinksYoroiActionInfo
  export type YoroiAction = LinksYoroiAction

  export interface Rules extends LinksUriRules {}

  export type Link<T extends LinksUriConfig> = LinksLink<T>

  export type Module<T extends LinksUriConfig> = LinksModule<T>

  export namespace Errors {
    export class ExtraParamsDenied extends LinksErrorExtraParamsDenied {}
    export class ForbiddenParamsProvided extends LinksErrorForbiddenParamsProvided {}
    export class RequiredParamsMissing extends LinksErrorRequiredParamsMissing {}
    export class ParamsValidationFailed extends LinksErrorParamsValidationFailed {}
    export class UnsupportedAuthority extends LinksErrorUnsupportedAuthority {}
    export class UnsupportedVersion extends LinksErrorUnsupportedVersion {}
    export class SchemeNotImplemented extends LinksErrorSchemeNotImplemented {}
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

    export type ProtocolParams = ApiProtocolParams

    export interface Actions {
      getProtocolParams: () => Promise<ProtocolParams>
    }
  }
}

export namespace Numbers {
  export type Locale = NumberLocale
  export type AtomicValue = NumbersAtomicValue

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

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export namespace Api {
    export type TokenInfosResponse = PortfolioApiTokenInfosResponse
    export type TokenDiscoveryResponse = PortfolioApiTokenDiscoveryResponse
    export type TokenTraitsResponse = PortfolioApiTokenTraitsResponse
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
}

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
    export class Validation extends ExchangeValidationError {}
    export class Unknown extends ExchangeUnknownError {}
    export class ProviderNotFound extends ExchangeProviderNotFoundError {}
  }
}

export namespace Network {
  export type Api = NetworkApi
  export type Manager = NetworkManager
  export type Config = NetworkConfig
  export type EraConfig = NetworkEraConfig
  export type EpochInfo = NetworkEpochInfo
  export type EpochProgress = NetworkEpochProgress
}

export * from './helpers/types'
export * from './helpers/storage'
export * from './api/cardano'
