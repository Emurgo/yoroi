import {debounce} from '@yoroi/common'
import {
  isDomain,
  isResolvableDomain,
  useResolverCryptoAddresses,
} from '@yoroi/resolver'
import {validateAndExtractAddressInfo} from '@yoroi/tx'
import {Resolver} from '@yoroi/types'

import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {
  AddressErrorInvalid,
  AddressErrorWrongNetwork,
} from '~/features/Send/common/errors'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {logger} from '~/kernel/logger/logger'

/**
 * Check if a string looks like a valid Cardano address format
 * This prevents calling CSL functions on invalid strings
 */
const looksLikeValidAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false
  const trimmed = address.trim()
  return (
    trimmed.startsWith('addr') ||
    trimmed.startsWith('stake') ||
    trimmed.startsWith('Ae2') ||
    trimmed.startsWith('DdzFF') ||
    /^[0-9a-fA-F]{64,}$/.test(trimmed) // Hex address (at least 32 bytes)
  )
}

export type AddressInputState = {
  // Resolution state
  isResolving: boolean
  resolvedAddress: string | null
  selectedNameServer: Resolver.NameServer | null
  isDomainInput: boolean
  isUnsupportedDomain: boolean
  isNotResolvedDomain: boolean
  isWrongBlockchainError: boolean
  receiverError: Error | null

  // Validation state
  isValidatingAddress: boolean
  addressValidated: boolean | undefined
  addressError: Error | null

  // Combined state
  isLoading: boolean
  isValid: boolean
  hasError: boolean
  errorMessage: string
}

export type UseAddressInputOptions = {
  onResolved?: (address: string) => void
  onResolvedWithDetails?: (
    address: string,
    nameServer: Resolver.NameServer | null,
  ) => void
  debounceDelay?: number
}

export const useAddressInput = (
  value: string,
  options?: UseAddressInputOptions,
): AddressInputState => {
  const queryClient = useQueryClient()
  const {selected} = useWalletManager()
  const {chainId} = selected.networkManager
  const {onResolved, onResolvedWithDetails, debounceDelay = 300} = options ?? {}

  const isDomainInput = isResolvableDomain(value)
  const isUnsupportedDomain = !isResolvableDomain(value) && isDomain(value)
  // Determine if we should resolve (domain input with content)
  const shouldResolve = isDomainInput && value.trim().length > 0

  // If it starts with "$" but isn't resolvable yet (like just "$"), treat it as potential domain
  // This prevents validating "$" as an address
  const isPotentialDomain =
    value.trim().startsWith('$') && !isResolvableDomain(value)

  // Resolution logic (from useSendReceiver)
  // Always pass value to resolver (like Send does), but use enabled to control execution
  // IMPORTANT: Use strategy: 'all' explicitly to match Send funnel behavior
  const {
    error: receiverError,
    cryptoAddresses,
    refetch,
    isLoading: isResolvingAddressess,
  } = useResolverCryptoAddresses({resolve: value, strategy: 'all'}, {
    enabled: shouldResolve,
  } as Parameters<typeof useResolverCryptoAddresses>[1])

  const isNotResolvedDomain = React.useMemo(
    () =>
      !isUnsupportedDomain &&
      !isResolvingAddressess &&
      cryptoAddresses.length > 0 &&
      cryptoAddresses.every(
        ({address, error}) =>
          // Domain not resolved if: address is null OR error is not null
          address === null || error !== null,
      ),
    [cryptoAddresses, isResolvingAddressess, isUnsupportedDomain],
  )

  const isWrongBlockchainError = React.useMemo(
    () =>
      isNotResolvedDomain &&
      cryptoAddresses.some(
        ({error}) => error instanceof Resolver.Errors.WrongBlockchain,
      ),
    [cryptoAddresses, isNotResolvedDomain],
  )

  // Get resolved address and name server
  // For domains: get from cryptoAddresses
  // For direct addresses: use the validated address (set below when validation succeeds)
  const [resolvedAddressFromDomains, setResolvedAddressFromDomains] =
    React.useState<string | null>(null)
  const [validatedDirectAddress, setValidatedDirectAddress] = React.useState<
    string | null
  >(null)

  // Update resolved address from domain resolution
  React.useEffect(() => {
    if (cryptoAddresses.length === 0) {
      setResolvedAddressFromDomains(null)
      return
    }

    const successful = cryptoAddresses.find(
      ({address, error}) => address !== null && error === null,
    )
    const result = successful?.address ?? null

    setResolvedAddressFromDomains(result)
  }, [cryptoAddresses, value, isDomainInput])

  // Combined resolved address: domain resolution OR validated direct address
  const resolvedAddress = React.useMemo(() => {
    return isDomainInput ? resolvedAddressFromDomains : validatedDirectAddress
  }, [isDomainInput, resolvedAddressFromDomains, validatedDirectAddress])

  const selectedNameServer = React.useMemo(() => {
    if (cryptoAddresses.length === 0) {
      return null
    }
    const successful = cryptoAddresses.find(
      ({address, error}) => address !== null && error === null,
    )
    return (successful?.nameServer as Resolver.NameServer) ?? null
  }, [cryptoAddresses])

  // Debounced refetch logic
  const debouncedRefetch = React.useMemo(
    () => debounce(refetch, debounceDelay),
    [refetch, debounceDelay],
  )

  const cancelPendingRequests = React.useCallback(
    () => queryClient.cancelQueries({queryKey: ['useResolverCryptoAddresses']}),
    [queryClient],
  )

  // Refetch logic (from useSendReceiver) - trigger when domain input changes
  // Only refetch when domain input or value changes, not on status/fetchStatus changes
  React.useEffect(() => {
    if (isDomainInput && value.trim().length > 0) {
      // Cancel pending requests first, then trigger debounced refetch
      // The debounce delay ensures the cancel completes before refetch starts
      cancelPendingRequests()
        .then(() => {
          debouncedRefetch.call()
        })
        .catch(() => {
          // Still try to refetch even if cancel fails
          debouncedRefetch.call()
        })
    } else {
      cancelPendingRequests()
    }
    return () => {
      debouncedRefetch.clear()
    }
  }, [
    isDomainInput,
    value,
    debouncedRefetch,
    cancelPendingRequests,
    shouldResolve,
  ])

  // Address validation logic (from useSendAddress)
  // Only validate resolved addresses or direct addresses (not domain inputs)
  // CRITICAL: For domain inputs, NEVER validate the input itself - only validate resolved addresses
  const addressToValidate = React.useMemo(() => {
    // If it's a domain input, ONLY validate the resolved address (never the domain input itself)
    if (isDomainInput) {
      return resolvedAddressFromDomains || ''
    }
    // If it's a potential domain (starts with "$" but not resolvable yet), don't validate
    // This prevents validating "$" or "$x" as addresses while user is typing
    if (isPotentialDomain) {
      return ''
    }
    // For direct addresses, only validate if it looks like a valid address format
    // This prevents validating partial/invalid inputs like "addr" or incomplete addresses
    const trimmed = value.trim()
    if (trimmed.length > 0 && looksLikeValidAddress(trimmed)) {
      return trimmed
    }
    return ''
  }, [resolvedAddressFromDomains, isDomainInput, isPotentialDomain, value])

  const [addressValidated, setAddressValidated] = React.useState<
    boolean | undefined
  >(undefined)
  const [addressError, setAddressError] = React.useState<Error | null>(null)
  const [isValidatingAddress, setIsValidatingAddress] = React.useState(false)

  React.useEffect(() => {
    // Reset validation state when addressToValidate becomes empty
    if (addressToValidate.length === 0) {
      setAddressValidated(undefined)
      setAddressError(null)
      setIsValidatingAddress(false)
      return
    }

    // Only validate if address looks valid (already checked in addressToValidate, but double-check)
    if (!looksLikeValidAddress(addressToValidate)) {
      setAddressValidated(undefined)
      setAddressError(null)
      setIsValidatingAddress(false)
      return
    }

    setIsValidatingAddress(true)
    validateAddress(addressToValidate, chainId)
      .then(() => {
        setAddressValidated(true)
        setAddressError(null)
      })
      .catch((error) => {
        setAddressValidated(false)
        setAddressError(error as Error)
      })
      .finally(() => {
        setIsValidatingAddress(false)
      })
  }, [addressToValidate, chainId, value, isDomainInput])

  // For direct addresses, set resolved address when validation succeeds
  React.useEffect(() => {
    if (!isDomainInput && addressValidated && addressToValidate.length > 0) {
      setValidatedDirectAddress(addressToValidate)
    } else if (!isDomainInput) {
      setValidatedDirectAddress(null)
    }
  }, [isDomainInput, addressValidated, addressToValidate, value])

  // Notify parent when address is resolved
  React.useEffect(() => {
    if (!onResolved && !onResolvedWithDetails) {
      return
    }

    if (value.trim().length === 0) {
      onResolved?.('')
      onResolvedWithDetails?.('', null)
      return
    }

    if (isDomainInput) {
      // For domains/handles, ONLY use resolved address when available and not resolving
      if (resolvedAddress && !isResolvingAddressess) {
        onResolved?.(resolvedAddress)
        onResolvedWithDetails?.(resolvedAddress, selectedNameServer)
      } else {
        // Clear if domain is not yet resolved or still resolving
        onResolved?.('')
        onResolvedWithDetails?.('', null)
      }
    } else {
      // For regular addresses, use validated address if available, otherwise use trimmed value
      // Only pass address if it's validated (addressValidated === true)
      if (addressValidated && validatedDirectAddress) {
        onResolved?.(validatedDirectAddress)
        onResolvedWithDetails?.(validatedDirectAddress, null)
      } else {
        // Don't pass unvalidated addresses
        onResolved?.('')
        onResolvedWithDetails?.('', null)
      }
    }
  }, [
    resolvedAddress,
    selectedNameServer,
    onResolved,
    onResolvedWithDetails,
    isResolvingAddressess,
    value,
    isDomainInput,
    addressValidated,
    validatedDirectAddress,
  ])

  // Error detection logic (from useReceiverError)
  const isLoading = isResolvingAddressess || isValidatingAddress
  const {hasError, errorMessage} = React.useMemo(() => {
    // NOTE: order matters
    if (isLoading) {
      logger.debug('[AddressInput] Error check skipped - still loading')
      return {hasError: false, errorMessage: ''}
    }
    if (isUnsupportedDomain) {
      logger.warn('[AddressInput] Error: Unsupported domain', {value})
      return {
        hasError: true,
        errorMessage: 'helperAddressErrorInvalid', // Will be resolved by caller
      }
    }
    if (isWrongBlockchainError) {
      logger.warn('[AddressInput] Error: Wrong blockchain', {value})
      return {
        hasError: true,
        errorMessage: 'helperAddressErrorWrongBlockchain',
      }
    }
    if (isNotResolvedDomain) {
      logger.warn('[AddressInput] Error: Domain not resolved', {
        value,
        cryptoAddressesCount: cryptoAddresses.length,
      })
      return {
        hasError: true,
        errorMessage: 'helperResolverErrorDomainNotFound',
      }
    }
    if (receiverError != null) {
      logger.warn('[AddressInput] Error: Receiver error', {
        value,
        receiverError: receiverError.message,
      })
      return {
        hasError: true,
        errorMessage: 'helperAddressErrorInvalid',
      }
    }
    if (addressError instanceof AddressErrorWrongNetwork) {
      logger.warn('[AddressInput] Error: Wrong network', {
        value,
        addressToValidate,
        chainId,
      })
      return {
        hasError: true,
        errorMessage: 'helperAddressErrorWrongNetwork',
      }
    }
    if (addressError != null) {
      logger.warn('[AddressInput] Error: Address validation failed', {
        value,
        addressToValidate,
        addressError: addressError.message,
        errorType: addressError.constructor.name,
      })
      return {
        hasError: true,
        errorMessage: 'helperAddressErrorInvalid',
      }
    }

    logger.debug('[AddressInput] No errors detected')
    return {hasError: false, errorMessage: ''}
  }, [
    isLoading,
    isUnsupportedDomain,
    isWrongBlockchainError,
    isNotResolvedDomain,
    receiverError,
    addressError,
    value,
    cryptoAddresses.length,
    addressToValidate,
    chainId,
  ])

  const isValid = addressValidated === true && !hasError

  return {
    // Resolution state
    isResolving: isResolvingAddressess,
    resolvedAddress,
    selectedNameServer,
    isDomainInput,
    isUnsupportedDomain,
    isNotResolvedDomain,
    isWrongBlockchainError,
    receiverError,

    // Validation state
    isValidatingAddress,
    addressValidated,
    addressError,

    // Combined state
    isLoading,
    isValid,
    hasError,
    errorMessage,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = async (address: string, chainId: number) => {
  // Don't attempt CSL validation if it doesn't look like a valid address format
  if (!looksLikeValidAddress(address)) {
    logger.debug('[AddressInput] Skipping CSL validation - invalid format', {
      address,
    })
    throw new AddressErrorInvalid()
  }

  try {
    const addressInfo = await validateAndExtractAddressInfo(address)

    if (!addressInfo) {
      throw new AddressErrorInvalid()
    }

    if (addressInfo.networkId !== chainId) {
      throw new AddressErrorWrongNetwork()
    }

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Address validation failed')
  }
}
