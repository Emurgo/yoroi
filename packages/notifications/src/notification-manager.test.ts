import {notificationManagerMaker} from './notification-manager'

describe('NotificationManager', () => {
  it('should be defined', () => {
    expect(notificationManagerMaker()).toBeDefined()
  })

  it('should return default config if not set', async () => {
    const manager = notificationManagerMaker()
    const config = await manager.config.read()
    expect(config).toEqual({
      PrimaryTokenPriceChanged: {
        interval: '24h',
        notify: true,
        threshold: 10,
      },
    })
  })
})
