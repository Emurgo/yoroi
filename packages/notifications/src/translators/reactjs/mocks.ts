import {mountAsyncStorage} from '@yoroi/common'
import {notificationManagerMaker} from '../../notification-manager'

export const createManagerMock = () => {
  const eventsStorage = mountAsyncStorage({path: 'events/'})
  const configStorage = mountAsyncStorage({path: 'config/'})
  return notificationManagerMaker({
    eventsStorage,
    configStorage,
    display: jest.fn(),
  })
}
