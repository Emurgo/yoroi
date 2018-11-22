// @flow
import {encryptData, decryptData} from './util'
import {WrongPassword} from './errors'
import {getAppId} from '../helpers/appSettings'
import storage from '../utils/storage'

const CUSTOM_PIN_HASH = '/customPinHash'

export const encryptAndStoreCustomPin = async (pin: string): Promise<void> => {
  const appId = await getAppId()
  const appIdHex = Buffer.from(appId, 'utf-8').toString('hex')
  const pinHash = await encryptData(appIdHex, pin)

  await storage.write(CUSTOM_PIN_HASH, pinHash)
}

export const authenticateByCustomPin = async (
  pinCandidate: string,
): Promise<boolean> => {
  const customPinHash = await storage.read(CUSTOM_PIN_HASH)

  try {
    await decryptData(customPinHash, pinCandidate)
    return true
  } catch (err) {
    if (err instanceof WrongPassword) {
      return false
    }
    throw err
  }
}
