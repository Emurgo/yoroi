import {isNameServer, useResolverCryptoAddresses} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {useQueryClient} from 'react-query'

import {debounceMaker} from '../../../utils/debounceMaker'
import {useSend} from './SendContext'

export const useSendInputReceiver = () => {
  const queryClient = useQueryClient()

  const {targets, selectedTargetIndex, receiverResolveChanged, addressRecordsFetched} = useSend()
  const receiver = targets[selectedTargetIndex].receiver

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
              addressRecords[nameServer] = address
            } else {
              return {[nameServer]: address}
            }
          return addressRecords
        },
        undefined,
      )
      // TODO: revisit
      // addressRecordsFetched(records)
      console.log(records)
      addressRecordsFetched({
        handle: 'addr1vxggvx6uq9mtf6e0tyda2mahg84w8azngpvkwr5808ey6qsy2ww7d',
        cns: 'addr1qywgh46dqu7lq6mp5c6tzldpmzj6uwx335ydrpq8k7rru4q6yhkfqn5pc9f3z76e4cr64e5mf98aaeht6zwf8xl2nc9qr66sqg',
      })
    }
  }, [addressRecordsFetched, cryptoAddresses, isSuccess])

  return {
    isResolvingAddressess,
    receiverError,
  }
}
