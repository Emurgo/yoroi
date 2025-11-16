import {
  isDomain,
  isResolvableDomain,
  useResolverCryptoAddresses,
} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'

import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

const debounceMaker = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) => {
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

export type AddressResolutionState = {
  isResolving: boolean
  resolvedAddress: string | null
  selectedNameServer: Resolver.NameServer | null
  cryptoAddresses: Resolver.AddressesResponse
  isDomainInput: boolean
  isValid: boolean
  isUnsupportedDomain: boolean
  isNotResolvedDomain: boolean
  isWrongBlockchainError: boolean
  receiverError: Error | null
}

export const useAddressResolution = (
  value: string,
  options?: {
    onResolved?: (address: string) => void
    debounceDelay?: number
  },
): AddressResolutionState => {
  const queryClient = useQueryClient()
  const {onResolved, debounceDelay = 300} = options ?? {}

  const isDomainInput = isResolvableDomain(value)
  const isUnsupportedDomain = !isResolvableDomain(value) && isDomain(value)

  // Track the last successfully resolved address to prevent flickering
  const lastSuccessfulResolutionRef = React.useRef<{
    value: string
    resolvedAddress: string | null
    selectedNameServer: Resolver.NameServer | null
    cryptoAddresses: Resolver.AddressesResponse
  } | null>(null)

  // Only resolve if it's a domain input
  const shouldResolve = isDomainInput && value.trim().length > 0

  const {
    cryptoAddresses,
    refetch,
    isLoading: isResolvingAddresses,
    isSuccess,
    data,
    error: receiverError,
  } = useResolverCryptoAddresses({resolve: shouldResolve ? value : ''}, {
    enabled: shouldResolve,
  } as Parameters<typeof useResolverCryptoAddresses>[1])

  // Use data directly if available (works even when query is disabled but has cached data)
  const effectiveCryptoAddresses = data ?? cryptoAddresses

  // Update last successful resolution when we have a successful result
  React.useEffect(() => {
    if (effectiveCryptoAddresses.length > 0) {
      const successful = effectiveCryptoAddresses.find(
        ({address, error}: {address: string | null; error: Error | null}) =>
          address !== null && error === null,
      )
      if (successful && successful.address) {
        lastSuccessfulResolutionRef.current = {
          value,
          resolvedAddress: successful.address,
          selectedNameServer: successful.nameServer as Resolver.NameServer,
          cryptoAddresses: effectiveCryptoAddresses,
        }
      }
    } else if (
      !isResolvingAddresses &&
      isDomainInput &&
      value.trim().length > 0
    ) {
      // Clear cache if resolution failed and we're not resolving anymore
      // But only if we have a domain input (not a regular address)
      if (
        lastSuccessfulResolutionRef.current &&
        lastSuccessfulResolutionRef.current.value !== value
      ) {
        // Only clear if the value changed (user typed something different)
        // Don't clear if it's the same value but just no data yet
      }
    }
  }, [
    isSuccess,
    effectiveCryptoAddresses,
    value,
    isResolvingAddresses,
    isDomainInput,
  ])

  // Use current data if available and matches current value, otherwise use last successful
  const currentCryptoAddresses = React.useMemo(() => {
    // If we have current successful data, use it
    if (effectiveCryptoAddresses.length > 0) {
      const hasSuccessful = effectiveCryptoAddresses.some(
        ({address, error}: {address: string | null; error: Error | null}) =>
          address !== null && error === null,
      )
      if (hasSuccessful) {
        return effectiveCryptoAddresses
      }
    }
    // If we have a previous successful resolution for the same or similar value, use it
    // This ensures we keep showing the check mark even when query is disabled
    if (
      lastSuccessfulResolutionRef.current &&
      (lastSuccessfulResolutionRef.current.value === value ||
        value.startsWith(lastSuccessfulResolutionRef.current.value))
    ) {
      return lastSuccessfulResolutionRef.current.cryptoAddresses
    }
    return []
  }, [effectiveCryptoAddresses, value])

  const resolvedAddress = React.useMemo(() => {
    // First try current data
    if (currentCryptoAddresses.length > 0) {
      const successful = currentCryptoAddresses.find(
        ({address, error}: {address: string | null; error: Error | null}) =>
          address !== null && error === null,
      )
      if (successful?.address) {
        return successful.address
      }
    }

    // Fall back to cached successful resolution if value matches
    if (
      lastSuccessfulResolutionRef.current &&
      (lastSuccessfulResolutionRef.current.value === value ||
        value.startsWith(lastSuccessfulResolutionRef.current.value))
    ) {
      return lastSuccessfulResolutionRef.current.resolvedAddress
    }

    return null
  }, [currentCryptoAddresses, value])

  const selectedNameServer = React.useMemo((): Resolver.NameServer | null => {
    if (currentCryptoAddresses.length === 0) return null

    const successful = currentCryptoAddresses.find(
      ({address, error}: {address: string | null; error: Error | null}) =>
        address !== null && error === null,
    )
    return (successful?.nameServer as Resolver.NameServer) ?? null
  }, [currentCryptoAddresses])

  const debouncedRefetch = React.useMemo(
    () => debounceMaker(refetch, debounceDelay),
    [refetch, debounceDelay],
  )

  const cancelPendingRequests = React.useCallback(
    () => queryClient.cancelQueries({queryKey: ['useResolverCryptoAddresses']}),
    [queryClient],
  )

  // Handle resolution when domain is resolved
  React.useEffect(() => {
    if (isDomainInput && value.trim().length > 0) {
      cancelPendingRequests().then(() => debouncedRefetch.call())
    } else {
      cancelPendingRequests()
    }
    return () => debouncedRefetch.clear()
  }, [isDomainInput, value, debouncedRefetch, cancelPendingRequests])

  // Notify parent when address is resolved or input changes
  React.useEffect(() => {
    if (!onResolved) return

    if (value.trim().length === 0) {
      // Clear resolved address when input is empty
      onResolved('')
    } else if (isDomainInput) {
      // For domains/handles, ONLY use resolved address when available and resolved
      // Don't pass unresolved domains to avoid errors
      if (resolvedAddress && !isResolvingAddresses) {
        onResolved(resolvedAddress)
      } else {
        // Clear if domain is not yet resolved or still resolving
        onResolved('')
      }
    } else {
      // For regular addresses, validate it looks like an address before using
      const trimmed = value.trim()
      // Basic validation: must start with addr, stake, or be hex-like
      if (
        trimmed.startsWith('addr') ||
        trimmed.startsWith('stake') ||
        trimmed.startsWith('Ae2') ||
        trimmed.startsWith('DdzFF') ||
        /^[0-9a-fA-F]+$/.test(trimmed)
      ) {
        onResolved(trimmed)
      } else {
        // Don't pass invalid addresses
        onResolved('')
      }
    }
  }, [resolvedAddress, onResolved, isResolvingAddresses, value, isDomainInput])

  // Determine if address is valid
  const isValid = React.useMemo(() => {
    if (isResolvingAddresses) return false
    if (isDomainInput) {
      return resolvedAddress !== null
    }
    // For regular addresses, check if it looks valid
    const trimmed = value.trim()
    return (
      trimmed.length > 0 &&
      (trimmed.startsWith('addr') ||
        trimmed.startsWith('stake') ||
        trimmed.startsWith('Ae2') ||
        trimmed.startsWith('DdzFF') ||
        /^[0-9a-fA-F]{64,}$/.test(trimmed))
    )
  }, [isResolvingAddresses, isDomainInput, resolvedAddress, value])

  // Error detection similar to Send funnel
  const isNotResolvedDomain = React.useMemo(
    () =>
      !isUnsupportedDomain &&
      !isResolvingAddresses &&
      effectiveCryptoAddresses.length > 0 &&
      effectiveCryptoAddresses.every(
        ({error}: {error: Error | null}) => error !== null,
      ),
    [effectiveCryptoAddresses, isResolvingAddresses, isUnsupportedDomain],
  )

  const isWrongBlockchainError = React.useMemo(
    () =>
      isNotResolvedDomain &&
      effectiveCryptoAddresses.some(
        ({error}: {error: Error | null}) =>
          error instanceof Resolver.Errors.WrongBlockchain,
      ),
    [effectiveCryptoAddresses, isNotResolvedDomain],
  )

  return {
    isResolving: isResolvingAddresses,
    resolvedAddress,
    selectedNameServer,
    cryptoAddresses: currentCryptoAddresses,
    isDomainInput,
    isValid,
    isUnsupportedDomain,
    isNotResolvedDomain,
    isWrongBlockchainError,
    receiverError: receiverError as Error | null,
  }
}
