import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

type ResolverActions = {
  saveResolverNoticeStatus: Resolver.Storage['notice']['save']
  readResolverNoticeStatus: Resolver.Storage['notice']['read']
  getCryptoAddress: Resolver.Api['getCryptoAddress']
  resolvedAddressSelectedChanged: (resolvedAddressSelected: ResolverState['resolvedAddressSelected']) => void
}

type ResolverState = {
  resolvedAddressSelected: Resolver.AddressResponse | null
}

const ResolverContext = React.createContext<undefined | (ResolverActions & ResolverState)>(undefined)
export const ResolverProvider = ({
  children,
  resolverModule,
}: {
  children: React.ReactNode
  resolverModule: Resolver.Module
}) => {
  const [state, dispatch] = React.useReducer(resolverReducer, {
    ...initialState,
  })

  const actions = React.useRef<ResolverActions>({
    saveResolverNoticeStatus: (noticed: boolean) => resolverModule.notice.save(noticed),
    readResolverNoticeStatus: resolverModule.notice.read,
    getCryptoAddress: (receiver: Resolver.Receiver['domain']) => resolverModule.address.getCryptoAddress(receiver),
    resolvedAddressSelectedChanged: (resolvedAddressSelected: ResolverState['resolvedAddressSelected']) =>
      dispatch({type: 'resolvedAddressSelectedChanged', resolvedAddressSelected}),
  }).current

  const context = React.useMemo(() => ({...state, ...actions}), [actions, state])

  return <ResolverContext.Provider value={context}>{children}</ResolverContext.Provider>
}

export const useResolver = () => React.useContext(ResolverContext) || missingProvider()

const missingProvider = () => {
  throw new Error('ResolverProvider is missing')
}

export type ResolverAction = {
  type: 'resolvedAddressSelectedChanged'
  resolvedAddressSelected: ResolverState['resolvedAddressSelected']
}

const resolverReducer = (state: ResolverState, action: ResolverAction) => {
  switch (action.type) {
    case 'resolvedAddressSelectedChanged':
      return {
        ...state,
        resolvedAddressSelected: action.resolvedAddressSelected,
      }

    default:
      return state
  }
}

export const initialState: ResolverState = {
  resolvedAddressSelected: null,
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
    queryFn: () => getCryptoAddress(receiver),
    ...options,
  })

  return {
    ...query,
    addresses: query.data ?? [],
  }
}

export const isDomain = (receiver: string) => /.+\..+/.test(receiver)
export const isHandle = (receiver: string): boolean => receiver.startsWith('$')
