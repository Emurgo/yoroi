import {Banners} from '@yoroi/types'
import {toNumber} from '@yoroi/common'
import {freeze} from 'immer'

export const bannersManagerMaker = <K extends string = string>({
  storage,
}: Readonly<Banners.Config<K>>): Readonly<Banners.Manager<K>> => {
  const dismiss = (id: K) => {
    storage.setItem(id, new Date().getTime().toString())
  }

  const dismissedAt = (id: K) => {
    return toNumber(storage.getItem(id))
  }

  return freeze({dismiss, dismissedAt})
}
