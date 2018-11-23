// @flow
import {encryptData, decryptData} from './util'
import {WrongPassword} from './errors'

export const encryptCustomPin = async (
  appId: string,
  pin: string,
): Promise<void> => {
  const appIdHex = Buffer.from(appId, 'utf-8').toString('hex')
  const pinHash = await encryptData(appIdHex, pin)
  return pinHash
}

export const authenticateByCustomPin = async (
  customPinHash: string,
  pinCandidate: string,
): Promise<boolean> => {
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
