import {authWithOs} from '../common/constants'

export const useEnableAuthWithOs = (
  options?: UseMutationOptions<void, Error>,
) => {
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()
  const {authWithOs: enable, ...mutation} = useAuthWithOs({
    ...options,
    onSuccess: async (data, variables, context) => {
      await enableAuthWithOs(storage)
      queryClient.invalidateQueries(['authSetting'])
      options?.onSuccess?.(data, variables, context)
    },
  })

  return {...mutation, enableAuthWithOs: enable}
}

export const enableAuthWithOs = async (storage: App.Storage) => {
  const settingsStorage = storage.join('appSettings/')
  await settingsStorage.setItem('auth', authWithOs)

  const pin = await settingsStorage.getItem('customPinHash')
  if (pin == null) return

  return settingsStorage.removeItem('customPinHash')
}
