import {atoms as a, useTheme} from '@yoroi/theme'
import {isByronAddress} from '@yoroi/tx'

import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {ScrollView, Text} from 'react-native'

import {AddressInput} from '~/common/AddressInput/AddressInput'
import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {redemptionApi} from '../api/redemptionApi'
import {useAirdropAddressCache} from '../common/airdropAddressCache'

const ManualAddressModalContent = () => {
  const {closeModal, setLoading, setCanContinue, setFooter} = useModal()
  const addressCache = useAirdropAddressCache()
  const queryClient = useQueryClient()
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const [address, setAddress] = React.useState('')
  const [isValid, setIsValid] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Use ref to store the latest handler to avoid recreating footer unnecessarily
  const handleCheckEligibilityRef = React.useRef<
    (() => Promise<void>) | undefined
  >(undefined)

  const handleCheckEligibility = React.useCallback(async () => {
    if (!isValid || !address.trim()) {
      return
    }

    const trimmedAddress = address.trim()

    // Skip Byron addresses - they don't support airdrop
    if (isByronAddress(trimmedAddress)) {
      setError('Byron addresses are not supported for airdrop')
      setLoading(false)
      return
    }

    setError(null)
    setLoading(true)

    try {
      // Check if address already exists in wallet addresses
      // This would be handled by useAirdropEligibility, but we check here to avoid duplicates
      const schedule = await redemptionApi.getThawSchedule(trimmedAddress)

      // Calculate next thaw date
      const now = new Date()
      const upcomingThaws = schedule.thaws
        .filter((thaw) => {
          const thawDate = new Date(thaw.thawing_period_start)
          return thawDate > now && thaw.status === 'upcoming'
        })
        .sort(
          (a, b) =>
            new Date(a.thawing_period_start).getTime() -
            new Date(b.thawing_period_start).getTime(),
        )

      const nextThawDate =
        upcomingThaws.length > 0
          ? (upcomingThaws[0]?.thawing_period_start ?? null)
          : null

      // Save as external address and eligible
      await addressCache.addExternalAddress(trimmedAddress)
      await addressCache.updateEligibleAddress(trimmedAddress, nextThawDate)

      // Invalidate queries to refresh allocations
      await queryClient.invalidateQueries({
        queryKey: [persistPrefixKeyword, 'airdropEligibility'],
      })

      // Explicitly refetch and wait for completion to ensure the new address appears
      await queryClient.refetchQueries({
        queryKey: [persistPrefixKeyword, 'airdropEligibility'],
        type: 'active', // Only refetch active queries
      })

      // Close modal after queries are updated
      closeModal()
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof err.message === 'string'
      ) {
        if (err.message.includes('ADDRESS_NOT_FOUND')) {
          // Expected error - address has no allocations
          logger.info('External address has no allocations', {address})
          setError(strings.airdrop.noAllocations)
        } else if (err.message.includes('API_ACCESS_FORBIDDEN')) {
          // Expected error - API access forbidden
          logger.info('API access forbidden for external address', {address})
          setError('Access forbidden. Please try again later.')
        } else {
          // Unexpected error - log as error
          logger.error('Failed to check eligibility for external address', {
            address,
            error: err,
          })
          setError(err.message)
        }
      } else {
        // Unexpected error - log as error
        logger.error('Failed to check eligibility for external address', {
          address,
          error: err,
        })
        setError('Failed to check eligibility. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [
    address,
    isValid,
    addressCache,
    closeModal,
    setLoading,
    strings,
    queryClient,
  ])

  // Store latest handler in ref
  React.useEffect(() => {
    handleCheckEligibilityRef.current = handleCheckEligibility
  }, [handleCheckEligibility])

  // Memoize the validation change handler to prevent infinite loops
  const handleValidationChange = React.useCallback(
    (isValid: boolean) => {
      setIsValid(isValid)
      setCanContinue(isValid)
    },
    [setCanContinue],
  )

  // Create stable footer handler that uses ref
  const footerHandlerRef = React.useRef(() => {
    handleCheckEligibilityRef.current?.()
  })

  // Memoize footer elements to prevent unnecessary recreations
  const footerWithHandler = React.useMemo(
    () => <ManualAddressModalFooter onPress={footerHandlerRef.current} />,
    [],
  )
  const footerWithoutHandler = React.useMemo(
    () => <ManualAddressModalFooter />,
    [],
  )

  // Track previous validity to avoid unnecessary footer updates
  const prevIsValidRef = React.useRef(isValid)

  // Update footer when validity changes (only depend on isValid to avoid loops)
  React.useEffect(() => {
    // Only update footer if validity actually changed
    if (prevIsValidRef.current !== isValid) {
      prevIsValidRef.current = isValid
      setFooter(isValid ? footerWithHandler : footerWithoutHandler)
    }
    // footerWithHandler and footerWithoutHandler are stable (memoized with empty deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, setFooter])

  return (
    <Modal.Content>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.airdrop.manualAddressDescription}
        </Text>

        <Space.Height.xl />

        <AddressInput
          value={address}
          onChangeText={setAddress}
          onValidationChange={handleValidationChange}
          placeholder={strings.send.addressInputLabel}
          label={strings.airdrop.address}
        />

        {error && (
          <>
            <Space.Height.md />
            <Text style={[a.body_2_md_regular, ta.text_error]}>{error}</Text>
          </>
        )}
      </ScrollView>
    </Modal.Content>
  )
}

const ManualAddressModalFooter = ({
  onPress = () => {},
}: {
  onPress?: () => void
}) => {
  const strings = useStrings()
  const {canContinue, isLoading} = useModal()

  return (
    <Modal.Footer>
      <Button
        title={strings.airdrop.checkEligibility}
        onPress={onPress}
        disabled={!canContinue}
        size="M"
        isLoading={isLoading}
      />
    </Modal.Footer>
  )
}

export const useManualAddressModal = () => {
  const {openModal} = useModal()
  const strings = useStrings()
  const queryClient = useQueryClient()

  const openManualAddressModal = React.useCallback(() => {
    openModal({
      content: <ManualAddressModalContent />,
      footer: <ManualAddressModalFooter />,
      title: strings.airdrop.manualAddressTitle,
      height: 500,
      canDiscard: true,
      canContinue: false,
      onClose: () => {
        // Invalidate queries to refresh allocations after adding external address
        queryClient.invalidateQueries({
          queryKey: [persistPrefixKeyword, 'airdropEligibility'],
        })
      },
    })
  }, [openModal, strings, queryClient])

  return {openManualAddressModal}
}
