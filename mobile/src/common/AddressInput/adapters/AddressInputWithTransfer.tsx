import {
  isNameServer,
  isResolvableDomain,
  useResolverCryptoAddresses,
} from '@yoroi/resolver'
import {useTransfer} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'

import {useIsFocused} from '@react-navigation/native'
import * as React from 'react'
import {TextInput as RNTextInput} from 'react-native'

import {AddressInput, AddressInputProps} from '../AddressInput'

export type AddressInputWithTransferProps = Omit<
  AddressInputProps,
  'value' | 'onChangeText' | 'onResolved' | 'onResolvedWithDetails'
> & {
  testID?: string
}

/**
 * Adapter component that bridges AddressInput with useTransfer context.
 * This allows Send funnel to use the common AddressInput component
 * while maintaining compatibility with useTransfer state management.
 *
 * The adapter:
 * - Maps useTransfer's receiver.resolve to AddressInput's value
 * - Maps receiverResolveChanged to onChangeText
 * - Updates useTransfer's addressRecords when resolution completes
 * - Handles multiple nameServers by building addressRecords from all cryptoAddresses
 */
export const AddressInputWithTransfer = React.forwardRef<
  RNTextInput,
  AddressInputWithTransferProps
>((props, ref) => {
  const isFocused = useIsFocused()
  const {
    targets,
    selectedTargetIndex,
    receiverResolveChanged,
    addressRecordsFetched,
  } = useTransfer()

  const target = targets[selectedTargetIndex]
  const receiver = target?.receiver ?? {resolve: '', as: 'address'}
  const value = receiver.resolve ?? ''

  // Call useResolverCryptoAddresses to get all cryptoAddresses (like useSendReceiver does)
  // This allows us to build addressRecords with all nameServers
  // IMPORTANT: Use strategy: 'all' explicitly to ensure we get all nameServer results
  const isDomainInput = isResolvableDomain(value)
  const {cryptoAddresses, isSuccess} = useResolverCryptoAddresses(
    {resolve: value, strategy: 'all'},
    {
      enabled: isDomainInput && value.trim().length > 0,
    } as Parameters<typeof useResolverCryptoAddresses>[1],
  )

  // Build addressRecords from cryptoAddresses (matching useSendReceiver logic)
  React.useEffect(() => {
    if (isSuccess && cryptoAddresses !== undefined && isDomainInput) {
      const records = cryptoAddresses.reduce(
        (
          addressRecords: Resolver.Receiver['addressRecords'],
          {address, nameServer},
        ) => {
          if (
            address !== null &&
            nameServer !== null &&
            isNameServer(nameServer) === true
          ) {
            if (addressRecords !== undefined) {
              return {...addressRecords, [nameServer]: address}
            } else {
              return {[nameServer]: address}
            }
          }
          return addressRecords
        },
        undefined,
      )
      addressRecordsFetched(records)
    } else if (!isDomainInput && value.trim().length > 0) {
      // For direct addresses, clear addressRecords (useTransfer will set entry.address directly)
      addressRecordsFetched(undefined)
    } else if (value.trim().length === 0) {
      // Clear when input is empty
      addressRecordsFetched(undefined)
    }
  }, [addressRecordsFetched, cryptoAddresses, isSuccess, isDomainInput, value])

  const handleChangeText = React.useCallback(
    (text: string) => {
      // Prevent automatic calls when the screen is not focused (RN TextInput bug)
      if (!isFocused) return
      receiverResolveChanged(text)
    },
    [isFocused, receiverResolveChanged],
  )

  // onResolvedWithDetails is called by AddressInput when resolution completes
  // We use it to track resolution, but addressRecordsFetched is already called above
  // based on cryptoAddresses, so this is mainly for compatibility
  const handleResolvedWithDetails = React.useCallback(
    (_address: string, _nameServer: Resolver.NameServer | null) => {
      // AddressInput handles resolution internally, and we update addressRecords
      // above based on cryptoAddresses. This callback is here for future use if needed.
    },
    [],
  )

  return (
    <AddressInput
      ref={ref}
      value={value}
      onChangeText={handleChangeText}
      onResolvedWithDetails={handleResolvedWithDetails}
      {...props}
    />
  )
})

AddressInputWithTransfer.displayName = 'AddressInputWithTransfer'
