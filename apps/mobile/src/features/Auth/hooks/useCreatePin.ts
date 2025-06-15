import {authWithPin} from '../common/constants'

export const useCreatePin = (
  options: UseMutationOptions<void, Error, string>,
) => {
  const storage = useAsyncStorage()
  const appSettingsStorage = storage.join('appSettings/')
  const mutation = useMutationWithInvalidations({
    invalidateQueries: [['authSetting']],
    mutationFn: async (pin) => {
      const installationId = await appSettingsStorage.getItem(
        'installationId',
        (data) => data,
      ) // LEGACY: installationId is not serialized
      if (!installationId) throw new Error('Invalid installation id')
      const encryptedPinHash = await encryptData(toHex(installationId), pin)
      await appSettingsStorage.setItem('auth', authWithPin)
      return appSettingsStorage.setItem('customPinHash', encryptedPinHash)
    },
    ...options,
  })

  return {
    createPin: mutation.mutate,
    ...mutation,
  }
}
const toHex = (text: string) => Buffer.from(text, 'utf8').toString('hex')
