// @flow
/* eslint-disable-next-line */ // $FlowFixMe
import {KeyStoreBridge} from 'NativeModules'
import * as Keychain from 'react-native-keychain'
import {Platform} from 'react-native'

import storage from '../utils/storage'
import assert from '../utils/assert'
import {decryptData, encryptData} from '../crypto/util'
import l10n from '../l10n'

export type EncryptionMethod = 'BIOMETRICS' | 'SYSTEM_PIN' | 'MASTER_PASSWORD'

class KeyStore {
  static async getData(
    keyId: string,
    encryptionMethod: EncryptionMethod,
    message: string,
    password?: string,
  ) {
    const translations = l10n.translations.Biometry
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    if (Platform.OS === 'ios' && encryptionMethod !== 'MASTER_PASSWORD') {
      const credentials = await Keychain.getGenericPassword({
        service: dataKey,
        authenticationPrompt: message,
      })
      return credentials.password
    }

    const data = await storage.read(`/keyStore/${dataKey}`)
    switch (encryptionMethod) {
      case 'BIOMETRICS': {
        let decryptedKey = ''
        // prettier-ignore
        const isBiometricPromptSupported =
          await KeyStoreBridge.isBiometricPromptSupported()

        if (isBiometricPromptSupported) {
          decryptedKey = await KeyStoreBridge.decryptDataWithBiometricPrompt(
            data,
            dataKey,
            translations.approveTransaction,
            translations.subtitle,
            translations.description,
            translations.cancelButton,
          )
        } else {
          decryptedKey = await KeyStoreBridge.decryptDataWithFingerprint(
            data,
            dataKey,
          )
        }

        return decryptedKey
      }

      case 'SYSTEM_PIN': {
        const decryptedKey = await KeyStoreBridge.decryptDataWithSystemPin(
          data,
          dataKey,
          message,
        )
        return decryptedKey
      }

      case 'MASTER_PASSWORD': {
        assert.assert(password, 'Password is provided')

        // $FlowFixMe
        return await decryptData(data, password)
      }

      default:
        throw new Error('Unsupported decryption method')
    }
  }

  static async cancelFingerprintScanning(reason: string) {
    if (Platform.OS === 'android') {
      await KeyStoreBridge.cancelFingerprintScanning(reason)
    }
  }

  static async storeData(
    keyId: string,
    encryptionMethod: EncryptionMethod,
    data: string,
    password?: string,
  ) {
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    let encryptedData = ''
    switch (encryptionMethod) {
      case 'BIOMETRICS': {
        encryptedData = await KeyStore.encryptByFingerprint(dataKey, data)
        break
      }

      case 'SYSTEM_PIN': {
        encryptedData = await KeyStore.encryptBySystemPin(dataKey, data)
        break
      }

      case 'MASTER_PASSWORD': {
        assert.assert(password, 'Password is provided')
        encryptedData = await KeyStore.encryptByMasterPassword(
          dataKey,
          data,
          // $FlowFixMe
          password,
        )
        break
      }

      default: {
        throw new Error(`Unsupported encryption method: ${encryptionMethod}`)
      }
    }

    await storage.write(`/keyStore/${dataKey}`, encryptedData)
  }

  static async encryptByFingerprint(dataKey: string, masterKey: string) {
    if (Platform.OS === 'android') {
      await KeyStoreBridge.initFingerprintKeys(dataKey)

      const fingerprintEncryptedMasterKey = await KeyStoreBridge.encryptData(
        masterKey,
        dataKey,
      )

      return fingerprintEncryptedMasterKey
    }

    if (Platform.OS === 'ios') {
      await Keychain.setGenericPassword('', masterKey, {
        service: dataKey,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      return ''
    }

    throw new Error('Unsupported platform')
  }

  static async encryptBySystemPin(dataKey: string, masterKey: string) {
    if (Platform.OS === 'android') {
      await KeyStoreBridge.initSystemPinKeys(dataKey)

      const systemPinEncryptedMasterKey = await KeyStoreBridge.encryptData(
        masterKey,
        dataKey,
      )

      return systemPinEncryptedMasterKey
    }

    if (Platform.OS === 'ios') {
      await Keychain.setGenericPassword('', masterKey, {
        service: dataKey,
        accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      })
      return ''
    }

    throw new Error('Unsupported platform')
  }

  static async encryptByMasterPassword(
    dataKey: string,
    masterKey: string,
    masterPassword: string,
  ) {
    assert.assert(masterPassword, 'Password is provided')

    const encryptedMasterKey = await encryptData(masterKey, masterPassword)

    return encryptedMasterKey
  }

  static async deleteKey(keyId: string, encryptionMethod: EncryptionMethod) {
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    if (Platform.OS === 'android') {
      await KeyStoreBridge.deleteAndroidKeyStoreAsymmetricKeyPair(dataKey)
      await storage.remove(`/keystore/${dataKey}`)
    } else if (Platform.OS === 'ios') {
      await Keychain.resetGenericPassword({service: dataKey})
    } else {
      throw new Error('Unsupported platform')
    }
  }

  static getDataKey(keyId: string, encryptionMethod: EncryptionMethod) {
    return `${keyId}-${encryptionMethod}`
  }

  static _getRejectionMessage(key: string): string {
    if (Platform.OS === 'android') {
      return KeyStoreBridge.REJECTION_MESSAGES[key]
    } else {
      return key
    }
  }

  // Android rejections
  static REJECTIONS = {
    ENCRYPTION_FAILED: KeyStore._getRejectionMessage('ENCRYPTION_FAILED'),
    ALREADY_DECRYPTING_DATA: KeyStore._getRejectionMessage(
      'ALREADY_DECRYPTING_DATA',
    ),
    SENSOR_LOCKOUT: KeyStore._getRejectionMessage('SENSOR_LOCKOUT'),
    NOT_RECOGNIZED: KeyStore._getRejectionMessage('NOT_RECOGNIZED'),
    DECRYPTION_FAILED: KeyStore._getRejectionMessage('DECRYPTION_FAILED'),
    SYSTEM_AUTH_NOT_SUPPORTED: KeyStore._getRejectionMessage(
      'SYSTEM_AUTH_NOT_SUPPORTED',
    ),
    FAILED_UNKNOWN_ERROR: KeyStore._getRejectionMessage('FAILED_UNKNOWN_ERROR'),
    CANCELED: KeyStore._getRejectionMessage('CANCELED'),
    FAILED: KeyStore._getRejectionMessage('FAILED'),
    BIOMETRIC_PROMPT_CANCELED: KeyStore._getRejectionMessage(
      'BIOMETRIC_PROMPT_CANCELED',
    ),
    INVALID_KEY: KeyStore._getRejectionMessage('INVALID_KEY'),
    KEY_NOT_DELETED: KeyStore._getRejectionMessage('KEY_NOT_DELETED'),
  }
}

export default KeyStore
