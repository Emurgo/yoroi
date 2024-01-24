import {isDomain, isNameServer, isResolvableDomain, useResolverCryptoAddresses} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {useQueryClient} from 'react-query'

import {debounceMaker} from '../../../utils/debounceMaker'
import {useSend} from './SendContext'

export const useSendReceiver = () => {
  const queryClient = useQueryClient()

  const {targets, selectedTargetIndex, receiverResolveChanged, addressRecordsFetched} = useSend()
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
