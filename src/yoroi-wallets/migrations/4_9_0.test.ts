import {storage} from '../storage'
import {migrateAuthSetting, OLD_OS_AUTH_KEY} from './4_9_0'
describe('migrateAuthSetting', () => {
  const installationId = 'uuidv4'
  const os = 'os'
  const pin = 'pin'

  beforeEach(async () => {
    await storage.clear()
    await storage.join('appSettings/').setItem('installationId', installationId)
  })

  it('method = null and no pin/os means new setup, it should remain null', async () => {
    await migrateAuthSetting(storage)

    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBeNull()
  })

  // correct way should make sure that .setItem was not called
  // but there are some issues when resetting back the storage mock
  it('method != null remains the same', async () => {
    await storage.join('appSettings/').setItem('auth', os)
    await migrateAuthSetting(storage)
    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBe(os)

    await storage.join('appSettings/').setItem('auth', pin)
    await migrateAuthSetting(storage)
    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBe(pin)
  })

  // if the store is inconsistent we favor OS, so the user can disable on device and it will ask for a new pin
  it('old store is pin + os (inconsistent), method = "os"', async () => {
    await storage.join('appSettings/').multiSet([
      ['customPinHash', 'encrypted-hash'],
      [OLD_OS_AUTH_KEY, true],
    ])

    await migrateAuthSetting(storage)

    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBe(os)
  })

  it('old store is pin, method = "pin"', async () => {
    await storage.join('appSettings/').multiSet([
      ['customPinHash', 'encrypted-hash'],
      [OLD_OS_AUTH_KEY, false],
    ])

    await migrateAuthSetting(storage)

    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBe(pin)
  })

  // pin hash is deleted when changing to OS auth
  it('old store is os, method = "os"', async () => {
    await storage.join('appSettings/').setItem('isSystemAuthEnabled', true)

    await migrateAuthSetting(storage)

    await expect(storage.join('appSettings/').getItem('auth')).resolves.toBe(os)
  })
})
