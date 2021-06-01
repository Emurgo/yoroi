// @flow
/* eslint-disable-next-line */
import * as Keychain from 'react-native-keychain'
import {Platform, NativeModules} from 'react-native'
import {defineMessages, type IntlShape} from 'react-intl'

import storage from '../utils/storage'
import assert from '../utils/assert'
import {decryptData, encryptData} from '../crypto/byron/util'

import type {EncryptionMethod} from './types'

const {KeyStoreBridge} = NativeModules

const messages = defineMessages({
  approveTransaction: {
    id: 'crypto.keystore.approveTransaction',
    defaultMessage: 'Authorize with your biometrics',
  },
  subtitle: {
    id: 'crypto.keystore.subtitle',
    defaultMessage: 'You can disable this feature at any time in the settings',
  },
  cancelButton: {
    id: 'crypto.keystore.cancelButton',
    defaultMessage: 'Cancel',
  },
})

class KeyStore {
  static storagePrefix = '/keystore'

  static async getData(
    keyId: string,
    encryptionMethod: EncryptionMethod,
    message: string,
    password?: string,
    intl: IntlShape,
  ) {
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    if (Platform.OS === 'ios' && encryptionMethod !== 'MASTER_PASSWORD') {
      const credentials = await Keychain.getGenericPassword({
        service: dataKey,
        authenticationPrompt: message,
      })
      return credentials.password
    }

    const data = await storage.read(`${KeyStore.storagePrefix}/${dataKey}`)
    if (data == null) {
      throw new Error('KeyStore::getData:: data is null, should never happen')
    }
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
            intl.formatMessage(messages.approveTransaction),
            intl.formatMessage(messages.subtitle),
            '', // adding a description seems redundant
            intl.formatMessage(messages.cancelButton),
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

  static async cancelFingerprintScanning(reason: string): Promise<boolean> {
    if (Platform.OS === 'android') {
      return await KeyStoreBridge.cancelFingerprintScanning(reason)
    }
    return false
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

    await storage.write(`${KeyStore.storagePrefix}/${dataKey}`, encryptedData)
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

  static async deleteData(keyId: string, encryptionMethod: EncryptionMethod) {
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    if (Platform.OS === 'android') {
      await KeyStoreBridge.deleteAndroidKeyStoreAsymmetricKeyPair(dataKey)
      await storage.remove(`${KeyStore.storagePrefix}/${dataKey}`)
    } else if (Platform.OS === 'ios') {
      await Keychain.resetGenericPassword({service: dataKey})
    } else {
      throw new Error('Unsupported platform')
    }
  }

  static getDataKey(keyId: string, encryptionMethod: EncryptionMethod) {
    return `${keyId}-${encryptionMethod}`
  }

  static async isKeyValid(keyId: string, encryptionMethod: EncryptionMethod) {
    const dataKey = KeyStore.getDataKey(keyId, encryptionMethod)

    if (Platform.OS === 'android') {
      return await KeyStoreBridge.isKeyValid(dataKey)
    } else if (Platform.OS === 'ios') {
      // on ios we set that key cannot be invalidated
      return true
    }

    throw new Error('Unsupported platform')
  }

  static _getRejectionMessage(key: string): string {
    if (Platform.OS === 'android') {
      return KeyStoreBridge.REJECTION_MESSAGES[key]
    }

    // eslint-disable-next-line
    // from https://opensource.apple.com/source/Security/Security-55471/sec/Security/SecBase.h.auto.html
    if (Platform.OS === 'ios') {
      switch (key) {
        case 'NOT_RECOGNIZED': {
          return '-25293'
        }

        case 'DECRYPTION_FAILED': {
          return '-26275'
        }

        case 'SYSTEM_AUTH_NOT_SUPPORTED': {
          return '-4'
        }

        case 'CANCELED': {
          return '-128'
        }

        default: {
          return 'FAILED_UNKNOWN_ERROR'
        }
      }
    }

    throw new Error('Unsupported platform')
  }

  // Android rejections
  static REJECTIONS = {
    ENCRYPTION_FAILED: KeyStore._getRejectionMessage('ENCRYPTION_FAILED'),
    ALREADY_DECRYPTING_DATA: KeyStore._getRejectionMessage(
      'ALREADY_DECRYPTING_DATA',
    ),
    SENSOR_LOCKOUT: KeyStore._getRejectionMessage('SENSOR_LOCKOUT'),
    SENSOR_LOCKOUT_PERMANENT: KeyStore._getRejectionMessage(
      'SENSOR_LOCKOUT_PERMANENT',
    ),
    NOT_RECOGNIZED: KeyStore._getRejectionMessage('NOT_RECOGNIZED'),
    DECRYPTION_FAILED: KeyStore._getRejectionMessage('DECRYPTION_FAILED'),
    SYSTEM_AUTH_NOT_SUPPORTED: KeyStore._getRejectionMessage(
      'SYSTEM_AUTH_NOT_SUPPORTED',
    ),
    FAILED_UNKNOWN_ERROR: KeyStore._getRejectionMessage('FAILED_UNKNOWN_ERROR'),
    CANCELED: KeyStore._getRejectionMessage('CANCELED'),
    FAILED: KeyStore._getRejectionMessage('FAILED'),
    SWAPPED_TO_FALLBACK: KeyStore._getRejectionMessage('SWAPPED_TO_FALLBACK'),
    INVALID_KEY: KeyStore._getRejectionMessage('INVALID_KEY'),
    KEY_NOT_DELETED: KeyStore._getRejectionMessage('KEY_NOT_DELETED'),
    KEY_NOT_CREATED: KeyStore._getRejectionMessage('KEY_NOT_CREATED'),
  }
}

export default KeyStore
