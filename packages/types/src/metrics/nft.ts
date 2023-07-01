import {MetricsTrackProperties} from './properties'

export type MetricsNftEvent =
  | 'nft_click_navigate'
  | 'nft_list_load'
  | 'nft_list_click_grid_big'
  | 'nft_list_click_grid_small'
  | 'nft_list_click_search'
  | 'nft_list_search'
  | 'nft_details_load'
  | 'nft_details_click_overview'
  | 'nft_details_click_metadata'
  | 'nft_details_overview_scroll'
  | 'nft_details_overview_copy_fingerprint'
  | 'nft_details_overview_copy_policyId'
  | 'nft_details_overview_explore_cardanoScan'
  | 'nft_details_overview_explore_cExplorer'
  | 'nft_details_metadata_scroll'
  | 'nft_details_metadata_copy_metadata'
  | 'nft_details_click_image'
  | 'nft_image_zoom'

type MetricsNftClickNavigate = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_click_navigate'
>
type MetricsNftListLoad = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_list_load'
>
type MetricsNftListClickGridBig = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_list_click_grid_big'
>
type MetricsNftListClickGridSmall = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_list_click_grid_small'
>
type MetricsNftListClickSearch = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_list_click_search'
>
type MetricsNftListSearch = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_list_search',
  {searchTerm: string}
>
type MetricsNftDetailsLoad = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_load'
>
type MetricsNftDetailsClickOverview = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_click_overview'
>
type MetricsNftDetailsClickMetadata = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_click_metadata'
>
type MetricsNftDetailsOverviewScroll = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_overview_scroll'
>
type MetricsNftDetailsOverviewCopyFingerprint = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_overview_copy_fingerprint'
>
type MetricsNftDetailsOverviewCopyPolicyId = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_overview_copy_policyId'
>
type MetricsNftDetailsOverviewExploreCardanoScan = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_overview_explore_cardanoScan'
>
type MetricsNftDetailsOverviewExploreCExplorer = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_overview_explore_cExplorer'
>
type MetricsNftDetailsMetadataScroll = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_metadata_scroll'
>
type MetricsNftDetailsMetadataCopyMetadata = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_metadata_copy_metadata'
>
type MetricsNftDetailsClickImage = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_details_click_image'
>
type MetricsNftImageZoom = MetricsTrackProperties<
  MetricsNftEvent,
  'nft_image_zoom'
>

export type MetricsNftTrack =
  | MetricsNftClickNavigate
  | MetricsNftListLoad
  | MetricsNftListClickGridBig
  | MetricsNftListClickGridSmall
  | MetricsNftListClickSearch
  | MetricsNftListSearch
  | MetricsNftDetailsLoad
  | MetricsNftDetailsClickOverview
  | MetricsNftDetailsClickMetadata
  | MetricsNftDetailsOverviewScroll
  | MetricsNftDetailsOverviewCopyFingerprint
  | MetricsNftDetailsOverviewCopyPolicyId
  | MetricsNftDetailsOverviewExploreCardanoScan
  | MetricsNftDetailsOverviewExploreCExplorer
  | MetricsNftDetailsMetadataScroll
  | MetricsNftDetailsMetadataCopyMetadata
  | MetricsNftDetailsClickImage
  | MetricsNftImageZoom
