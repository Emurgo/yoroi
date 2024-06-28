import {isDomain, isNameServer, isResolvableDomain, useResolverCryptoAddresses} from '@yoroi/resolver'
import {useTransfer} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {useQueryClient} from 'react-query'

export const useSendReceiver = () => {
  const queryClient = useQueryClient()

  const {targets, selectedTargetIndex, receiverResolveChanged, addressRecordsFetched} = useTransfer()
  const receiver = targets[selectedTargetIndex].receiver
  const isUnsupportedDomain = !isResolvableDomain(receiver.resolve) && isDomain(receiver.resolve)

  const {
    error: receiverError,
    cryptoAddresses,
    refetch,
    isLoading: isResolvingAddressess,
    isSuccess,
  } = useResolverCryptoAddresses(
    {resolve: receiver.resolve},
    {
      enabled: false,
    },
  )

  const isNotResolvedDomain = React.useMemo(
    () =>
      !isUnsupportedDomain &&
      !isResolvingAddressess &&
      cryptoAddresses.length > 0 &&
      cryptoAddresses.every(({error}) => error !== null),
    [cryptoAddresses, isResolvingAddressess, isUnsupportedDomain],
  )

  const isWrongBlockchainError = React.useMemo(
    () => isNotResolvedDomain && cryptoAddresses.some(({error}) => error instanceof Resolver.Errors.WrongBlockchain),
    [cryptoAddresses, isNotResolvedDomain],
  )

  const debouncedRefetch = React.useMemo(() => debounceMaker(refetch, 300), [refetch])

  const cancelPendingRequests = React.useCallback(
    () => queryClient.cancelQueries({queryKey: ['useResolverCryptoAddresses']}),
    [queryClient],
  )

  React.useEffect(() => {
    if (receiver.as === 'domain') cancelPendingRequests().then(() => debouncedRefetch.call())
    if (receiver.as === 'address') cancelPendingRequests()
    return () => debouncedRefetch.clear()
  }, [
    receiver.as,
    refetch,
    receiver.resolve,
    debouncedRefetch,
    queryClient,
    cancelPendingRequests,
    receiverResolveChanged,
  ])

  React.useEffect(() => {
    if (isSuccess && cryptoAddresses !== undefined) {
      const records = cryptoAddresses.reduce(
        (addressRecords: Resolver.Receiver['addressRecords'], {address, nameServer}) => {
          if (address !== null && nameServer !== null && isNameServer(nameServer) === true)
            if (addressRecords !== undefined) {
              return {...addressRecords, [nameServer]: address}
            } else {
              return {[nameServer]: address}
            }
          return addressRecords
        },
        undefined,
      )
      addressRecordsFetched(records)
    }
  }, [addressRecordsFetched, cryptoAddresses, isSuccess])

  return {
    isWrongBlockchainError,
    isNotResolvedDomain,
    isResolvingAddressess,
    isUnsupportedDomain,
    receiverError,
  }
}

const debounceMaker = <T extends (...args: never[]) => unknown>(callback: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {
    clear,
    call,
  } as const
}
