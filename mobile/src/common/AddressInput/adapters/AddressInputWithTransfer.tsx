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
  targetIndex?: number // Optional: if provided, use this specific target index instead of selectedTargetIndex
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
const AddressInputWithTransferInner = React.forwardRef<
  RNTextInput,
  AddressInputWithTransferProps
>(({targetIndex: propTargetIndex, ...props}, ref) => {
  const isFocused = useIsFocused()
  const {
    targets,
    selectedTargetIndex,
    receiverResolveChanged,
    addressRecordsFetched,
    targetIndexSelected,
  } = useTransfer()

  // DO NOT sync selectedTargetIndex on mount - this causes infinite loops when multiple inputs mount simultaneously
  // Instead, sync only when the input receives focus (see handleFocus below)

  // Use propTargetIndex if provided, otherwise use selectedTargetIndex
  // When propTargetIndex is provided, value should be stable and not change when selectedTargetIndex changes
  const targetIndexToUse = propTargetIndex ?? selectedTargetIndex
  const target = targets[targetIndexToUse]
  // Extract value directly - when propTargetIndex is provided, this will always read from the same target
  // and won't change when selectedTargetIndex changes
  const value = target?.receiver?.resolve ?? ''

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
  // When using propTargetIndex, pass it directly to addressRecordsFetched
  // Use a ref to track the last processed value to prevent duplicate calls
  const lastProcessedValueRef = React.useRef<string>('')

  React.useEffect(() => {
    // Skip if we've already processed this value
    if (lastProcessedValueRef.current === value) {
      return
    }

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
      // Pass propTargetIndex if provided, otherwise it will use selectedTargetIndex
      addressRecordsFetched(records, propTargetIndex)
      lastProcessedValueRef.current = value
    } else if (!isDomainInput && value.trim().length > 0) {
      // For direct addresses, clear addressRecords (useTransfer will set entry.address directly)
      addressRecordsFetched(undefined, propTargetIndex)
      lastProcessedValueRef.current = value
    } else if (value.trim().length === 0) {
      // Clear when input is empty
      addressRecordsFetched(undefined, propTargetIndex)
      lastProcessedValueRef.current = value
    }
  }, [
    addressRecordsFetched,
    cryptoAddresses,
    isSuccess,
    isDomainInput,
    value,
    propTargetIndex,
  ])

  const handleChangeText = React.useCallback(
    (text: string) => {
      // Prevent automatic calls when the screen is not focused (RN TextInput bug)
      if (!isFocused) return
      // Pass propTargetIndex if provided, otherwise it will use selectedTargetIndex
      receiverResolveChanged(text, propTargetIndex)
    },
    [isFocused, receiverResolveChanged, propTargetIndex],
  )

  // Sync selectedTargetIndex when input receives focus (for backward compatibility)
  // Using a ref to avoid including props in dependencies (props.onFocus might change)
  const onFocusRef = React.useRef(props.onFocus)
  React.useEffect(() => {
    onFocusRef.current = props.onFocus
  }, [props.onFocus])

  const handleFocus = React.useCallback(
    (_e: unknown) => {
      // Sync selectedTargetIndex on focus for backward compatibility
      // This ensures components that don't use propTargetIndex still work
      if (
        propTargetIndex !== undefined &&
        propTargetIndex !== selectedTargetIndex
      ) {
        targetIndexSelected(propTargetIndex)
        // Reset the processed ref so addressRecords can be updated
        lastProcessedValueRef.current = ''
      }
      onFocusRef.current?.(_e)
    },
    [propTargetIndex, selectedTargetIndex, targetIndexSelected],
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
      onFocus={handleFocus}
      {...props}
    />
  )
})

AddressInputWithTransferInner.displayName = 'AddressInputWithTransferInner'

export const AddressInputWithTransfer = AddressInputWithTransferInner
AddressInputWithTransfer.displayName = 'AddressInputWithTransfer'
