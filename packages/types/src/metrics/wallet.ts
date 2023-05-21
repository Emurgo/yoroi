import {Track} from './track'

export type WalletEvent =
  | 'wallet_list'
  | 'wallet_select'
  | 'wallet_close'
  | 'wallet_remove'

type WalletList = Track<WalletEvent, 'wallet_list'>
type WalletSelect = Track<WalletEvent, 'wallet_select'>
type WalletClose = Track<WalletEvent, 'wallet_close'>
type WalletRemove = Track<WalletEvent, 'wallet_remove'>

export type WalletTrack = WalletList | WalletSelect | WalletClose | WalletRemove
