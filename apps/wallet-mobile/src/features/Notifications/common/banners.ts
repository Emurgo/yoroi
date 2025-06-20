import {Notifications} from '@yoroi/types'
import {Subject} from 'rxjs'

/**
 * Banners are special notifications that have a fixed ids, so triggering them overrides the previous banner of the same id
 */
export const bannerTriggersSubject = new Subject<Notifications.BannerEvent>()

type BannerProps = {
  id: (typeof BannerIds)[keyof typeof BannerIds]
  title: string
  body: string
  isRead?: boolean
}

export const showBanner = ({id, title, body, isRead = false}: BannerProps) => {
  bannerTriggersSubject.next({
    trigger: Notifications.Trigger.Banner,
    id,
    date: new Date().toISOString(),
    isRead,
    metadata: {
      title,
      body,
    },
  })
}

export const BannerIds = {
  BuyCrypto: 23478934728,
  TestAda: 234682356,
  GovernanceParticipation: 576512769,
  UtxoConsolidation: 76578456,
} as const
