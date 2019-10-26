// @flow
import {encryptData, decryptData} from './util'
import {WrongPassword} from './errors'

export const encryptCustomPin = (installationId: string, pin: string) => {
  const installationIdHex = Buffer.from(installationId, 'utf-8').toString('hex')
  const pinHash = encryptData(installationIdHex, pin)
  return pinHash
}

export const authenticateByCustomPin = (
  customPinHash: string,
  pinCandidate: string,
): boolean => {
  try {
    decryptData(customPinHash, pinCandidate)
    return true
  } catch (err) {
    if (err instanceof WrongPassword) {
      return false
    }
    throw err
  }
}
