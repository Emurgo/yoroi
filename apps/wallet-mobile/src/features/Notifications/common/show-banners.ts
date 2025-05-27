import {Notifications as NotificationTypes} from '@yoroi/types'
import {Subject} from 'rxjs'

export const bannerTriggersSubject = new Subject<NotificationTypes.BannerEvent>()

type BannerProps = {
  id: number
  title: string
  body: string
}

export const showBanner = ({id, title, body}: BannerProps) => {
  bannerTriggersSubject.next({
    trigger: NotificationTypes.Trigger.Banner,
    id,
    date: new Date().toISOString(),
    isRead: false,
    metadata: {
      title,
      body,
    },
  })
}

export const BannerIds = {
  BuyCrypto: 23478934728,
  TestAda: 234682356,
} as const
