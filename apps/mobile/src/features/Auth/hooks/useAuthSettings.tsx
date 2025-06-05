export const useAuthSetting = (
  options?: UseQueryOptions<AuthSetting, Error>,
) => {
  const storage = useAsyncStorage()
  const query = useQuery({
    suspense: true,
    queryKey: ['authSetting'],
    queryFn: () => getAuthSetting(storage),
    ...options,
  })

  return query.data ?? null
}

export const getAuthSetting = async (storage: App.Storage) => {
  const authSetting = await storage
    .join('appSettings/')
    .getItem('auth', parseAuthSetting)
  return authSetting ?? null
}
