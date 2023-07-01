import {MetricsNftTrack} from './nft'
import {MetricsWalletTrack} from './wallet'

export type MetricsTrack<T> = (MetricsNftTrack | MetricsWalletTrack) & {
  options?: T
}
