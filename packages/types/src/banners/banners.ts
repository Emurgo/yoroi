import {AppObservableStorage} from '../app/observable-storage'

export interface BannersManager<K extends string = string> {
  dismiss: (id: K) => void
  dismissedAt: (id: K) => number
}

export interface BannersConfig<K extends string = string> {
  readonly storage: AppObservableStorage<false, K>
}
