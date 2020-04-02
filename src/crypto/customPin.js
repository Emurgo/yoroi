// @flow
import {encryptData, decryptData, KNOWN_ERROR_MSG} from './byron/util'
import {WrongPassword} from './errors'

export const encryptCustomPin = async (installationId: string, pin: string) => {
  const installationIdHex = Buffer.from(installationId, 'utf-8').toString('hex')
  const pinHash = await encryptData(installationIdHex, pin)
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
    if (
      err instanceof WrongPassword ||
      // for some reason WrongPassword is not detected by instanceof so I need
      // to add this hack
      err.message === KNOWN_ERROR_MSG.DECRYPT_FAILED
    ) {
      return false
    }
    throw err
  }
}
