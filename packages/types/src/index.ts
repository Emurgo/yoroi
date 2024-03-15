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
import {LinksLink, LinksModule, LinksUriConfig} from './links/link'
import {
  LinksErrorExtraParamsDenied,
  LinksErrorForbiddenParamsProvided,
  LinksErrorParamsValidationFailed,
  LinksErrorRequiredParamsMissing,
  LinksErrorSchemeNotImplemented,
  LinksErrorUnsupportedAuthority,
  LinksErrorUnsupportedVersion,
} from './links/errors'
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
  ApiProtocolParamsResult,
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
import {AppObserver, AppSubscriber} from './app/simple-observer'
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
import {ExchangeManager} from './exchange/module'
import {ExchangeBlockchainCode} from './exchange/blockchain'
import {ExchangeManagerOptions} from './exchange/build'
import {ExchangeCoin} from './exchange/coin'
import {ExchangeFiat} from './exchange/fiat'
import {ExchangeReferralUrlQueryStringParams} from './exchange/params'
import {ExchangeUnknownError, ExchangeValidationError} from './exchange/errors'
import {ExchangeOrderType} from './exchange/order'
import {
  ExchangeProvider,
  ExchangeProviderFeatures,
  ExchangeProviders,
} from './exchange/provider'
import {ExchangeApi} from './exchange/api'

export namespace App {
  export interface Storage<IsAsync extends boolean = true>
    extends AppStorage<IsAsync> {}
  export type StorageFolderName = AppStorageFolderName
  export interface MultiStorage<T, IsAsync extends boolean = true>
    extends AppMultiStorage<T, IsAsync> {}

  export interface ObservableStorage<IsAsync extends boolean = true>
    extends AppObservableStorage<IsAsync> {}
  export interface ObservableMultiStorage<T, IsAsync extends boolean = true>
    extends AppObservableMultiStorage<T, IsAsync> {}

  export type MultiStorageOptions<
    T,
    IsAsync extends boolean = true,
  > = AppMultiStorageOptions<T, IsAsync>

  export type Observer<T> = AppObserver<T>
  export type Subscriber<T> = AppSubscriber<T>

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
  export interface UriConfig extends LinksUriConfig {}
  export type Scheme = LinksUriConfig['scheme']
  export type Authority = LinksUriConfig['authority']
  export type Version = LinksUriConfig['version']
  export type Rules = LinksUriConfig['rules']

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

    export type ProtocolParamsResult = ApiProtocolParamsResult

    export interface Actions {
      getProtocolParams: () => Promise<ProtocolParamsResult>
    }
  }
}

export namespace Numbers {
  export type Locale = NumberLocale
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

export namespace Chain {
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

export namespace Exchange {
  export type Manager = ExchangeManager
  export type BlockchainCode = ExchangeBlockchainCode
  export type ManagerOptions = ExchangeManagerOptions
  export type Coin = ExchangeCoin
  export type Fiat = ExchangeFiat
  export type OrderType = ExchangeOrderType
  export type Provider = ExchangeProvider
  export const Provider = ExchangeProvider
  export type Providers = ExchangeProviders
  export type ProviderFeatures = ExchangeProviderFeatures
  export type ReferralUrlQueryStringParams =
    ExchangeReferralUrlQueryStringParams
  export interface Api extends ExchangeApi {}
  export namespace Errors {
    export class Validation extends ExchangeValidationError {}
    export class Unknown extends ExchangeUnknownError {}
  }
}

export * from './helpers/types'
export * from './helpers/storage'
export * from './api/cardano'
