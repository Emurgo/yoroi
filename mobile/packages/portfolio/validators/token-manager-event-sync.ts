import {Portfolio} from '@yoroi/types'

export const isEventTokenManagerSync = (
  data: unknown,
): data is Portfolio.Event.TokenManagerSync => {
  if (!data || typeof data !== 'object') return false
  if (!('ids' in data) || !('on' in data) || !('sourceId' in data)) return false
  return data.on === Portfolio.Event.ManagerOn.Sync
}
