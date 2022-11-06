export type AuthMethod = 'pin' | 'os' | undefined

export const OLD_OS_AUTH_KEY = '/appSettings/isSystemAuthEnabled'
export const INSTALLATION_ID_KEY = '/appSettings/installationId'
export const ENCRYPTED_PIN_HASH_KEY = '/appSettings/customPinHash'
export const AUTH_METHOD_KEY = '/appSettings/authMethod'
