import {decryptData, encryptData} from './commonUtils'
import {WrongPassword} from './errors'

export const encryptCustomPin = async (installationId: string, pin: string) => {
  const installationIdHex = Buffer.from(installationId, 'utf-8').toString('hex')
  const pinHash = await encryptData(installationIdHex, pin)
  return pinHash
}

export const authenticateByCustomPin = async (customPinHash: string, pinCandidate: string): Promise<boolean> => {
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
