import {MetricsTrackProperties} from './properties'

export type MetricsWalletEvent =
  | 'wallet_list'
  | 'wallet_select'
  | 'wallet_close'
  | 'wallet_remove'

type MetricsWalletList = MetricsTrackProperties<
  MetricsWalletEvent,
  'wallet_list'
>
type MetricsWalletSelect = MetricsTrackProperties<
  MetricsWalletEvent,
  'wallet_select'
>
type MetricsWalletClose = MetricsTrackProperties<
  MetricsWalletEvent,
  'wallet_close'
>
type MetricsWalletRemove = MetricsTrackProperties<
  MetricsWalletEvent,
  'wallet_remove'
>

export type MetricsWalletTrack =
  | MetricsWalletList
  | MetricsWalletSelect
  | MetricsWalletClose
  | MetricsWalletRemove
