import {Track} from '../types/track'

export type NftEvent =
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

type NftClickNavigate = Track<NftEvent, 'nft_click_navigate'>
type NftListLoad = Track<NftEvent, 'nft_list_load'>
type NftListClickGridBig = Track<NftEvent, 'nft_list_click_grid_big'>
type NftListClickGridSmall = Track<NftEvent, 'nft_list_click_grid_small'>
type NftListClickSearch = Track<NftEvent, 'nft_list_click_search'>
type NftListSearch = Track<NftEvent, 'nft_list_search', {searchTerm: string}>
type NftDetailsLoad = Track<NftEvent, 'nft_details_load'>
type NftDetailsClickOverview = Track<NftEvent, 'nft_details_click_overview'>
type NftDetailsClickMetadata = Track<NftEvent, 'nft_details_click_metadata'>
type NftDetailsOverviewScroll = Track<NftEvent, 'nft_details_overview_scroll'>
type NftDetailsOverviewCopyFingerprint = Track<
  NftEvent,
  'nft_details_overview_copy_fingerprint'
>
type NftDetailsOverviewCopyPolicyId = Track<
  NftEvent,
  'nft_details_overview_copy_policyId'
>
type NftDetailsOverviewExploreCardanoScan = Track<
  NftEvent,
  'nft_details_overview_explore_cardanoScan'
>
type NftDetailsOverviewExploreCExplorer = Track<
  NftEvent,
  'nft_details_overview_explore_cExplorer'
>
type NftDetailsMetadataScroll = Track<NftEvent, 'nft_details_metadata_scroll'>
type NftDetailsMetadataCopyMetadata = Track<
  NftEvent,
  'nft_details_metadata_copy_metadata'
>
type NftDetailsClickImage = Track<NftEvent, 'nft_details_click_image'>
type NftImageZoom = Track<NftEvent, 'nft_image_zoom'>

export type NftTrack =
  | NftClickNavigate
  | NftListLoad
  | NftListClickGridBig
  | NftListClickGridSmall
  | NftListClickSearch
  | NftListSearch
  | NftDetailsLoad
  | NftDetailsClickOverview
  | NftDetailsClickMetadata
  | NftDetailsOverviewScroll
  | NftDetailsOverviewCopyFingerprint
  | NftDetailsOverviewCopyPolicyId
  | NftDetailsOverviewExploreCardanoScan
  | NftDetailsOverviewExploreCExplorer
  | NftDetailsMetadataScroll
  | NftDetailsMetadataCopyMetadata
  | NftDetailsClickImage
  | NftImageZoom
