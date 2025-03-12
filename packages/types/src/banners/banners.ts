import {AppObservableStorage} from '../app/observable-storage'

export interface BannersManager<K extends string = string> {
  dismiss: (id: K) => void
  dismissedAt: (id: K) => number
}

export interface BannersConfig<K extends string = string> {
  readonly storage: AppObservableStorage<false, K>
}

export enum BannersId {
  DRep2UsStakingCenter = 'drep2us-on-staking-center',
  DRep2UsTxHistory = 'drep2us-on-tx-history',
}

export type BannersStorageKey = `${BannersId}`
