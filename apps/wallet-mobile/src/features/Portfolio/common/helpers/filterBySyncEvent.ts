import {Portfolio} from '@yoroi/types'

export function filterBySyncEvent({on}: Portfolio.Event.BalanceManager | Portfolio.Event.TokenManager) {
  return on === Portfolio.Event.ManagerOn.Sync
}
