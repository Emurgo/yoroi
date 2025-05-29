import {Locker} from '@emurgo/dullahan/.js/yoroi/Locker'
import {App} from '@yoroi/types'

export const decryptData = async (hexString: string, secretKey: string) => {
  const dataBytes = Buffer.from(hexString, 'hex')
  const secretKeyBytes = Buffer.from(secretKey, 'utf8')
  const locker = Locker(secretKeyBytes)

  try {
    const decryptedBytes = await locker.decrypt(dataBytes)
    return Buffer.from(decryptedBytes).toString('utf8')
  } catch (error) {
    throw new App.Errors.WrongPassword()
  }
}
