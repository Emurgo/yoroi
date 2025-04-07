import {mountAsyncStorage} from '@yoroi/common'

const appStorage = mountAsyncStorage({path: '/'})

const notificationStorage = appStorage.join('notifications/')

export const eventsStorage = notificationStorage.join('events/')
export const configStorage = notificationStorage.join('settings/')
export const uiStorage = notificationStorage.join('ui/')
