import {Notifications as NotificationTypes} from '@yoroi/types'
import {Subject} from 'rxjs'

export const bannerTriggersSubject = new Subject<NotificationTypes.BannerEvent>()

export const triggerBanner = (params: {id: number; title: string; body: string}) => {
  bannerTriggersSubject.next({
    trigger: NotificationTypes.Trigger.Banner,
    id: params.id,
    date: new Date().toISOString(),
    isRead: false,
    metadata: {
      title: params.title,
      body: params.body,
    },
  })
}

export const bannerIds = {
  buyCryptoBanner: 23478934728,
} as const
