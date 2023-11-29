import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

type ResolverActions = {
  saveResolverNoticeStatus: Resolver.Storage['notice']['save']
  readResolverNoticeStatus: Resolver.Storage['notice']['read']
  getCryptoAddress: Resolver.Api['getCryptoAddress']
}

const ResolverContext = React.createContext<undefined | ResolverActions>(undefined)
export const ResolverProvider = ({
  children,
  resolverModule,
}: {
  children: React.ReactNode
  resolverModule: Resolver.Module
}) => {
  const actions = React.useRef<ResolverActions>({
    saveResolverNoticeStatus: (noticed: boolean) => resolverModule.notice.save(noticed),
    readResolverNoticeStatus: resolverModule.notice.read,
    getCryptoAddress: (receiver: Resolver.Receiver['domain']) => resolverModule.address.getCryptoAddress(receiver),
  }).current

  const context = React.useMemo(() => ({...actions}), [actions])

  return <ResolverContext.Provider value={context}>{children}</ResolverContext.Provider>
}

export const useResolver = () => React.useContext(ResolverContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ResolverProvider is missing')
}

const queryKey = 'resolver'

export const useSaveResolverNoticeStatus = (options?: UseMutationOptions<void, Error, boolean>) => {
  const {saveResolverNoticeStatus} = useResolver()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    ...options,
    mutationKey: [queryKey],
    mutationFn: saveResolverNoticeStatus,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([queryKey])
      options?.onSuccess?.(data, variables, context)
    },
  })
  return {
    ...mutation,
    saveResolverNoticeStatus: mutation.mutate,
  }
}

export const useReadResolverNoticeStatus = () => {
  const {readResolverNoticeStatus} = useResolver()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [queryKey],
    queryFn: readResolverNoticeStatus,
    onSuccess: () => queryClient.invalidateQueries([queryKey]),
  })
  return {
    ...query,
    readResolverNoticeStatus: query.data,
  }
}

export const useResolverAddresses = (
  {receiver}: {receiver: string},
  options?: UseQueryOptions<Resolver.AddressesResponse>,
) => {
  const {getCryptoAddress} = useResolver()

  const query = useQuery({
    queryKey: [queryKey, receiver],
    queryFn: async () => {
      let addresses: Resolver.AddressesResponse = []

      if (isDomain(receiver) || isHandle(receiver)) {
        addresses = await getCryptoAddress(receiver)
      }

      return addresses
    },
    ...options,
  })

  return {
    ...query,
    address: query.data ?? [],
  }
}

const isDomain = (receiver: string) => /.+\..+/.test(receiver)
const isHandle = (receiver: string) => receiver.startsWith('$')
