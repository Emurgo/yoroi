import {mountAsyncStorage} from '@yoroi/common/src'
import {notificationManagerMaker} from '@yoroi/notifications'

const appStorage = mountAsyncStorage({path: '/'})

export const notificationManager = notificationManagerMaker({
  eventsStorage: appStorage.join('events/'),
  configStorage: appStorage.join('settings/'),
})
