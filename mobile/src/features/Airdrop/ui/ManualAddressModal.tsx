import {atoms as a, useTheme} from '@yoroi/theme'

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

// Shared handler ref so footer can access it
let handleCheckEligibilityRef: (() => Promise<void>) | null = null

const ManualAddressModalContent = () => {
  const {closeModal, setLoading, setCanContinue, setFooter} = useModal()
  const addressCache = useAirdropAddressCache()
  const queryClient = useQueryClient()
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const [address, setAddress] = React.useState('')
  const [isValid, setIsValid] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleCheckEligibility = React.useCallback(async () => {
    if (!isValid || !address.trim()) {
      return
    }

    setIsChecking(true)
    setError(null)
    setLoading(true)

    try {
      // Check if address already exists in wallet addresses
      // This would be handled by useAirdropEligibility, but we check here to avoid duplicates
      const schedule = await redemptionApi.getThawSchedule(address.trim())

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
      await addressCache.addExternalAddress(address.trim())
      await addressCache.updateEligibleAddress(address.trim(), nextThawDate)

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
      // Use a small delay to ensure UI updates
      setTimeout(() => {
        closeModal()
      }, 200)
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
      setIsChecking(false)
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

  // Store handler in ref so footer can access it
  React.useEffect(() => {
    handleCheckEligibilityRef = handleCheckEligibility
    return () => {
      handleCheckEligibilityRef = null
    }
  }, [handleCheckEligibility])

  // Update footer dynamically based on state
  React.useEffect(() => {
    setFooter(
      <Modal.Footer>
        <Button
          title={
            isChecking
              ? strings.airdrop.loading
              : strings.airdrop.checkEligibility
          }
          onPress={() => {
            handleCheckEligibilityRef?.()
          }}
          disabled={!isValid || isChecking || !address.trim()}
          size="M"
        />
      </Modal.Footer>,
    )
  }, [isChecking, isValid, address, setFooter, strings])

  // Update canContinue based on validation state
  React.useEffect(() => {
    const canContinue = isValid && !isChecking && address.trim().length > 0
    setCanContinue(canContinue)
  }, [isValid, isChecking, address, setCanContinue])

  // Reset state when component mounts (modal opens)
  React.useEffect(() => {
    setAddress('')
    setIsValid(false)
    setIsChecking(false)
    setError(null)
    setCanContinue(false)
    return () => {
      // Reset state when component unmounts (modal closes)
      setAddress('')
      setIsValid(false)
      setIsChecking(false)
      setError(null)
      handleCheckEligibilityRef = null
    }
  }, [setCanContinue])

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
          onValidationChange={setIsValid}
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

const ManualAddressModalFooter = () => {
  const strings = useStrings()
  const {canContinue = false} = useModal()

  return (
    <Modal.Footer>
      <Button
        title={strings.airdrop.checkEligibility}
        onPress={() => {
          handleCheckEligibilityRef?.()
        }}
        disabled={!canContinue}
        size="M"
      />
    </Modal.Footer>
  )
}

export const useManualAddressModal = () => {
  const {openModal} = useModal()
  const strings = useStrings()
  const queryClient = useQueryClient()
  const modalKeyRef = React.useRef(0)

  const openManualAddressModal = React.useCallback(() => {
    // Increment key to force remount and reset state
    modalKeyRef.current += 1
    const currentKey = modalKeyRef.current

    openModal({
      content: <ManualAddressModalContent key={`content-${currentKey}`} />,
      footer: <ManualAddressModalFooter key={`footer-${currentKey}`} />,
      title: strings.airdrop.manualAddressTitle,
      height: 500,
      canDiscard: true,
      canContinue: false,
      onClose: () => {
        // Invalidate queries to refresh allocations after adding external address
        queryClient.invalidateQueries({
          queryKey: ['persist', 'airdropEligibility'],
        })
      },
    })
  }, [openModal, strings, queryClient])

  return {openManualAddressModal}
}
