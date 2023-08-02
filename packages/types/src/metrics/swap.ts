import {SwapOrderType} from 'src/swap/module'
import {MetricsTrackProperties} from './properties'

export type MetricsSwapEvent =
  | 'swap_asset_from_changed'
  | 'swap_asset_to_changed'
  | 'swap_cancelation_settled'
  | 'swap_cancelation_submitted'
  | 'swap_initiated'
  | 'swap_order_requested'
  | 'swap_order_selected'
  | 'swap_order_settled'
  | 'swap_order_submitted'
  | 'swap_pool_changed'
  | 'swap_slippage_changed'

type MetricsSwapAssetFromChanged = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_asset_from_changed'
>

type MetricsSwapAssetToChanged = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_asset_to_changed'
>

type MetricsSwapCancelationSettled = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_cancelation_settled'
>

type MetricsSwapCancelationSubmitted = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_cancelation_submitted'
>

type MetricsSwapInitiated = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_initiated',
  {
    orderType: SwapOrderType
  }
>

type MetricsSwapOrderRequested = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_order_requested'
>

type MetricsSwapOrderSelected = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_order_selected'
>

type MetricsSwapOrderSettled = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_order_settled'
>

type MetricsSwapOrderSubmitted = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_order_submitted'
>

type MetricsSwapPoolChanged = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_pool_changed'
>

type MetricsSwapSlippageChanged = MetricsTrackProperties<
  MetricsSwapEvent,
  'swap_slippage_changed'
>

export type MetricsSwapTrack =
  | MetricsSwapAssetFromChanged
  | MetricsSwapAssetToChanged
  | MetricsSwapCancelationSettled
  | MetricsSwapCancelationSubmitted
  | MetricsSwapInitiated
  | MetricsSwapOrderRequested
  | MetricsSwapOrderSelected
  | MetricsSwapOrderSettled
  | MetricsSwapOrderSubmitted
  | MetricsSwapPoolChanged
  | MetricsSwapSlippageChanged
