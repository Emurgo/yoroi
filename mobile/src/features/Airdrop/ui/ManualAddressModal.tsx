import {atoms as a, useTheme} from '@yoroi/theme'
import {isByronAddress} from '@yoroi/tx'

import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'
import {ScrollView, Text} from 'react-native'

import {persistPrefixKeyword} from '~/kernel/connection/ConnectionProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

import {redemptionApi} from '../api/redemptionApi'
import {useAirdropAddressCache} from '../common/airdropAddressCache'

const ManualAddressModalContent = () => {
  const {closeModal, setLoading, setCanContinue, setFooter} = useModal()
  const addressCache = useAirdropAddressCache()
  const queryClient = useQueryClient()
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const [addressesText, setAddressesText] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<{
    processed: number
    skipped: number
    errors: number
  }>({processed: 0, skipped: 0, errors: 0})

  // Use ref to store the latest handler to avoid recreating footer unnecessarily
  const handleCheckEligibilityRef = React.useRef<
    (() => Promise<void>) | undefined
  >(undefined)

  const handleCheckEligibility = React.useCallback(async () => {
    if (!addressesText.trim()) {
      return
    }

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const processAddress = async (address: string): Promise<boolean> => {
      const trimmedAddress = address.trim()

      // Skip empty addresses
      if (!trimmedAddress) {
        return false
      }

      // Skip Byron addresses - they don't support airdrop
      if (isByronAddress(trimmedAddress)) {
        logger.info('Skipping Byron address', {address: trimmedAddress})
        return false
      }

      // Check cache first
      const [eligibleAddresses, notEligibleAddresses, externalAddresses] =
        await Promise.all([
          addressCache.getEligibleAddresses(),
          addressCache.getNotEligibleAddresses(),
          addressCache.getExternalAddresses(),
        ])

      // Skip if already in external addresses (already processed)
      if (externalAddresses.has(trimmedAddress)) {
        logger.info('Address already added', {address: trimmedAddress})
        return false
      }

      // Skip if already marked as not eligible
      if (notEligibleAddresses.has(trimmedAddress)) {
        logger.info('Address already marked as not eligible', {
          address: trimmedAddress,
        })
        return false
      }

      // If already eligible, just add to external addresses if not already there
      if (eligibleAddresses[trimmedAddress]) {
        await addressCache.addExternalAddress(trimmedAddress)
        logger.info('Address already eligible, added to external', {
          address: trimmedAddress,
        })
        return true
      }

      // Need to check API - add delay to avoid rate limiting
      await delay(200)

      try {
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
        return true
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof err.message === 'string'
        ) {
          if (err.message.includes('ADDRESS_NOT_FOUND')) {
            // Expected error - address has no allocations
            await addressCache.addNotEligibleAddress(trimmedAddress)
            logger.info('External address has no allocations', {
              address: trimmedAddress,
            })
            return false
          } else if (err.message.includes('API_ACCESS_FORBIDDEN')) {
            // Expected error - API access forbidden
            logger.warn('API access forbidden for external address', {
              address: trimmedAddress,
            })
            throw err
          } else {
            // Unexpected error - log as error
            logger.error('Failed to check eligibility for external address', {
              address: trimmedAddress,
              error: err,
            })
            throw err
          }
        } else {
          logger.error('Failed to check eligibility for external address', {
            address: trimmedAddress,
            error: err,
          })
          throw err
        }
      }
    }

    setError(null)
    setLoading(true)
    setResults({processed: 0, skipped: 0, errors: 0})

    const addresses = addressesText.split('\n').map((addr) => addr.trim())
    let processed = 0
    let skipped = 0
    let errors = 0

    try {
      for (const address of addresses) {
        try {
          const wasProcessed = await processAddress(address)
          if (wasProcessed) {
            processed++
          } else {
            skipped++
          }
          setResults({processed, skipped, errors})
        } catch (err) {
          errors++
          setResults({processed, skipped, errors})
          // Continue processing other addresses even if one fails
        }
      }

      // Invalidate queries to refresh allocations
      const queryKey = [persistPrefixKeyword, 'airdropEligibility'] as const
      await queryClient.invalidateQueries({
        queryKey,
      })

      // Explicitly refetch and wait for completion to ensure new addresses appear
      await queryClient.refetchQueries({
        queryKey,
        type: 'active', // Only refetch active queries
      })

      // Close modal after queries are updated
      closeModal()
    } catch (err: unknown) {
      logger.error('Failed to process addresses', {error: err})
      setError('Failed to process some addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [addressesText, addressCache, closeModal, setLoading, queryClient])

  // Store latest handler in ref
  React.useEffect(() => {
    handleCheckEligibilityRef.current = handleCheckEligibility
  }, [handleCheckEligibility])

  // Enable continue button if there's text
  React.useEffect(() => {
    setCanContinue(addressesText.trim().length > 0)
  }, [addressesText, setCanContinue])

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

  // Update footer when text changes
  React.useEffect(() => {
    const hasText = addressesText.trim().length > 0
    setFooter(hasText ? footerWithHandler : footerWithoutHandler)
    // footerWithHandler and footerWithoutHandler are stable (memoized with empty deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesText, setFooter])

  return (
    <Modal.Content>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.airdrop.manualAddressDescription}
        </Text>

        <Space.Height.xl />

        <TextInput
          value={addressesText}
          onChangeText={setAddressesText}
          placeholder="Enter addresses, one per line"
          label={strings.airdrop.address}
          multiline
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect={false}
          renderComponentStyle={{minHeight: 200}}
        />

        {error && (
          <>
            <Space.Height.md />
            <Text style={[a.body_2_md_regular, ta.text_error]}>{error}</Text>
          </>
        )}

        {(results.processed > 0 ||
          results.skipped > 0 ||
          results.errors > 0) && (
          <>
            <Space.Height.md />
            <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
              Processed: {results.processed} | Skipped: {results.skipped} |
              Errors: {results.errors}
            </Text>
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

  const openManualAddressModal = React.useCallback(() => {
    openModal({
      content: <ManualAddressModalContent />,
      footer: <ManualAddressModalFooter />,
      title: strings.airdrop.manualAddressTitle,
      height: 500,
      canDiscard: true,
      canContinue: false,
    })
  }, [openModal, strings])

  return {openManualAddressModal}
}
