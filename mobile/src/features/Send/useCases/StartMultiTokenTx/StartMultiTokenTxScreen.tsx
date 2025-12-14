import {truncateString} from '@yoroi/common'
import {
  domainNormalizer,
  handleApiConfig,
  isCnsDomain,
  isResolvableDomain,
} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {useSelectedWallet, useWalletManager} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Text, TextInput, TouchableOpacity, View} from 'react-native'

import {AddressInputWithTransfer} from '~/common/AddressInput/adapters/AddressInputWithTransfer'
import {useMultipartySend} from '~/features/Send/common/context/MultipartySendContext'
import {useTrackDomainUsage} from '~/features/Send/common/hooks/useTrackDomainUsage'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {useHasPendingTx} from '~/features/Transactions/hooks/useHasPendingTx'
import {useSelectMultipleWalletsModal} from '~/features/WalletManager/ui/modals/SelectMultipleWalletsModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {favoriteContactsStorage} from '~/kernel/storage/favorite-contacts-storage'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {Space} from '~/ui/Space/Space'

import {FavoriteContactsList} from './FavoriteContacts/FavoriteContactsList'
import {NotifySupportedNameServers} from './NotifySupportedNameServers/NotifySupportedNameServers'
import {SelectNameServer} from './SelectNameServer/SelectNameServer'
import {ShowErrors} from './ShowErrors'

export const StartMultiTokenTxScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {openSelectMultipleWalletsModal} = useSelectMultipleWalletsModal()
  const {palette: p} = useTheme()

  const hasPendingTx = useHasPendingTx({wallet})

  const {
    targets,
    selectedTargetIndex,
    receiverResolveChanged,
    targetAdded,
    targetRemoved,
    targetIndexSelected,
  } = useTransfer()

  const {scrollViewRef} = useScrollView()

  // Track domain usage for favorites
  useTrackDomainUsage()

  // Track selected input wallets for multiparty transactions
  const {selectedInputWalletIds, setSelectedInputWalletIds} =
    useMultipartySend()

  // Initialize with current wallet if empty
  React.useEffect(() => {
    if (selectedInputWalletIds.length === 0) {
      setSelectedInputWalletIds([wallet.id])
    }
  }, [wallet.id, selectedInputWalletIds.length, setSelectedInputWalletIds])

  // Track validation state per address
  const [addressValidations, setAddressValidations] = React.useState<
    Map<number, boolean>
  >(new Map())

  // Track which address input is currently active (being edited)
  const [activeInputIndex, setActiveInputIndex] = React.useState(0)

  // Restore validation state from existing targets when navigating back
  // A target is valid if it has a resolved address (entry.address) or a valid direct address (receiver.resolve)
  const previousTargetsLengthRef = React.useRef(targets.length)
  React.useEffect(() => {
    if (targets.length > 0) {
      // Restore validations when:
      // 1. Component mounts with existing targets (previousTargetsLengthRef is 0 but now we have targets)
      // 2. Targets length changes (targets added/removed)
      const targetsLengthChanged =
        previousTargetsLengthRef.current !== targets.length
      const hasNoValidations = addressValidations.size === 0

      if (targetsLengthChanged || hasNoValidations) {
        const restoredValidations = new Map<number, boolean>()
        targets.forEach((target, index) => {
          // Check if target has a valid address
          const hasResolvedAddress = Boolean(
            target.entry.address && target.entry.address.trim() !== '',
          )
          // Type guard: check if receiver.as is 'domain'
          const receiverAs = target.receiver.as as 'domain' | 'address'
          const isDomain = receiverAs === 'domain'
          const hasDirectAddress = Boolean(
            !isDomain &&
              target.receiver.resolve &&
              target.receiver.resolve.trim() !== '',
          )
          const isValid = hasResolvedAddress || hasDirectAddress
          restoredValidations.set(index, isValid)
        })
        setAddressValidations(restoredValidations)
        previousTargetsLengthRef.current = targets.length
      }
    } else {
      previousTargetsLengthRef.current = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets.length]) // Only depend on targets.length to avoid infinite loops

  // Initialize first target as selected on mount (only once)
  // Use a ref to ensure this only runs once, even if component re-renders
  const hasInitializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!hasInitializedRef.current && targets.length > 0) {
      hasInitializedRef.current = true
      if (selectedTargetIndex !== 0) {
        targetIndexSelected(0)
      }
      setActiveInputIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets.length])

  // When a new target is added, make it the active input
  React.useEffect(() => {
    if (targets.length > activeInputIndex + 1) {
      // A new target was added
      const newIndex = targets.length - 1
      setActiveInputIndex(newIndex)
      targetIndexSelected(newIndex)
    }
  }, [targets.length, activeInputIndex, targetIndexSelected])

  // Check if at least one address is valid
  const hasAtLeastOneValidAddress = React.useMemo(() => {
    if (targets.length === 0) return false
    return targets.some((_, index) => addressValidations.get(index) === true)
  }, [targets, addressValidations])

  const canGoNext =
    !hasPendingTx &&
    hasAtLeastOneValidAddress &&
    selectedInputWalletIds.length > 0

  const handleOnNext = async () => {
    // Save favorites for valid addresses before removing invalid ones
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const isValid = addressValidations.get(i) === true
      if (target && isValid) {
        const domainInput = target?.receiver.resolve?.trim()
        if (domainInput) {
          if (isResolvableDomain(domainInput) && !isCnsDomain(domainInput)) {
            try {
              const policyId = wallet.isMainnet
                ? handleApiConfig.mainnet.policyId
                : handleApiConfig.preprod.policyId
              const normalizedDomain =
                domainNormalizer(policyId, domainInput) || domainInput
              await favoriteContactsStorage.addFavorite(normalizedDomain, false)
            } catch {
              // Silently fail
            }
          }
        }
      }
    }

    // Remove invalid addresses before proceeding
    // Iterate in reverse order to avoid index shifting issues
    const invalidIndices: number[] = []
    for (let i = targets.length - 1; i >= 0; i--) {
      const isValid = addressValidations.get(i) === true
      if (!isValid) {
        invalidIndices.push(i)
      }
    }

    // Calculate how many valid targets we'll have after removal
    const validTargetCount = targets.length - invalidIndices.length

    // Remove invalid targets
    // Note: targetRemoved updates the targets array synchronously, so after all removals,
    // targets will only contain valid addresses
    for (const index of invalidIndices) {
      targetRemoved(index)
    }

    // Update addressValidations map - after removals, all remaining targets are valid
    // Rebuild the map to have entries 0..(validTargetCount-1) all set to true
    setAddressValidations(() => {
      const updated = new Map<number, boolean>()
      for (let i = 0; i < validTargetCount; i++) {
        updated.set(i, true)
      }
      return updated
    })

    // Navigate based on number of input wallets
    // After removals, targets array will only contain valid addresses
    const hasMultipleInputWallets = selectedInputWalletIds.length > 1

    if (hasMultipleInputWallets) {
      // Multiple wallets: go to ListAmountsToSendScreen to select which wallet to add assets for
      navigateTo.selectedTokens()
    } else {
      // Single wallet: go directly to asset selection
      // targets[0] will be valid since invalid ones were removed
      const amounts = targets[0]?.entry.amounts
      const shouldOpenAddToken = !amounts || Object.keys(amounts).length === 0
      if (shouldOpenAddToken) {
        navigateTo.addToken()
      } else {
        navigateTo.selectedTokens()
      }
    }
  }

  const handleAddAddress = () => {
    // Only add if current input is valid
    const currentInputIsValid =
      addressValidations.get(activeInputIndex) === true
    if (currentInputIsValid) {
      targetAdded()
      // activeInputIndex will be updated by useEffect above
    }
  }

  const handleEditAddress = (index: number) => {
    setActiveInputIndex(index)
    targetIndexSelected(index)
  }

  const handleRemoveAddress = (index: number) => {
    if (targets.length <= 1) return // Don't allow removing the last address
    targetRemoved(index)
    // Reindex validations
    setAddressValidations((prev) => {
      const updated = new Map(prev)
      updated.delete(index)
      const reindexed = new Map<number, boolean>()
      let newIndex = 0
      for (let i = 0; i < targets.length; i++) {
        if (i !== index && prev.has(i)) {
          reindexed.set(newIndex, prev.get(i) ?? false)
          newIndex++
        }
      }
      return reindexed
    })
    // Adjust activeInputIndex if needed
    if (activeInputIndex === index) {
      // If we removed the active input, switch to the last one
      const newActiveIndex = Math.max(0, targets.length - 2)
      setActiveInputIndex(newActiveIndex)
      targetIndexSelected(newActiveIndex)
    } else if (activeInputIndex > index) {
      // If we removed an address before the active one, adjust the index
      setActiveInputIndex(activeInputIndex - 1)
      targetIndexSelected(activeInputIndex - 1)
    }
  }

  const handleSelectInputWallets = React.useCallback(() => {
    openSelectMultipleWalletsModal({
      onSelect: (selectedIds) => {
        setSelectedInputWalletIds(selectedIds)
      },
      selectedWalletIds: Array.from(selectedInputWalletIds),
      excludeWalletIds: [],
      minSelection: 1,
      requiredWalletId: wallet.id, // Prevent unselecting the current wallet
      filter: (walletMeta) => {
        // Only show wallets on the same network
        const otherWallet = walletManager.getWalletById(walletMeta.id)
        return (
          otherWallet?.networkManager.chainId === wallet.networkManager.chainId
        )
      },
    })
  }, [
    openSelectMultipleWalletsModal,
    selectedInputWalletIds,
    wallet,
    walletManager,
    setSelectedInputWalletIds,
  ])

  const handleAddressValidationChange = React.useCallback(
    (index: number, isValid: boolean) => {
      setAddressValidations((prev) => {
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (prev.get(index) === isValid) {
          return prev
        }
        const updated = new Map(prev)
        updated.set(index, isValid)
        return updated
      })
    },
    [],
  )

  return (
    <SafeArea>
      <ScrollView
        ref={scrollViewRef}
        style={[a.pt_lg]}
        contentContainerStyle={[a.px_lg]}
        bounces={false}
      >
        <ShowErrors />

        <NotifySupportedNameServers />

        {/* Valid Address Cards */}
        {targets.map((target, index) => {
          const isValid = addressValidations.get(index) === true
          const isActive = index === activeInputIndex

          // Show card for valid addresses that are not currently being edited
          if (isValid && !isActive) {
            return (
              <AddressCard
                key={index}
                target={target}
                index={index}
                onEdit={() => handleEditAddress(index)}
                onRemove={
                  targets.length > 1
                    ? () => handleRemoveAddress(index)
                    : undefined
                }
              />
            )
          }

          return null
        })}

        {/* Active Address Input (only one shown at a time) */}
        {targets[activeInputIndex] && (
          <>
            <AddressInputForTarget
              targetIndex={activeInputIndex}
              label={strings.send.addressInputLabel}
              onValidationChange={handleAddressValidationChange}
              validationChangeIndex={activeInputIndex}
            />

            <FavoriteContactsList
              onSelectDomain={(domain) => {
                targetIndexSelected(activeInputIndex)
                receiverResolveChanged(domain, activeInputIndex)
              }}
            />

            <SelectNameServer />
          </>
        )}

        {/* Add Additional Address Button - only show when current input is valid */}
        {targets.length > 0 &&
          addressValidations.get(activeInputIndex) === true &&
          targets.length < 5 && (
            <>
              <Space.Height.lg />
              <TouchableOpacity
                onPress={handleAddAddress}
                style={[
                  a.flex_row,
                  a.align_center,
                  a.gap_sm,
                  a.p_md,
                  a.rounded_sm,
                  a.border,
                  {borderColor: p.primary_600, backgroundColor: p.gray_50},
                ]}
              >
                <Icon.Plus size={20} color={p.primary_600} />
                <Text style={[a.body_1_lg_medium, {color: p.primary_600}]}>
                  {strings.send.addAdditionalAddress}
                </Text>
              </TouchableOpacity>
            </>
          )}

        <Space.Height.lg />
      </ScrollView>

      <SafeArea.Footer>
        {/* Select Input Wallets Section */}
        <SelectInputWalletsButton
          selectedCount={selectedInputWalletIds.length}
          onPress={handleSelectInputWallets}
        />
        <Space.Height.lg />
        <NextButton
          onPress={handleOnNext}
          title={strings.send.next}
          disabled={!canGoNext}
          testID="nextButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

// Component to handle address input for a specific target index
const AddressInputForTarget = ({
  targetIndex,
  label,
  onValidationChange,
  validationChangeIndex,
  onRemove,
}: {
  targetIndex: number
  label: string
  onValidationChange: (index: number, isValid: boolean) => void
  validationChangeIndex: number
  onRemove?: () => void
}) => {
  const {palette: p} = useTheme()

  const inputRef = React.useRef<TextInput>(null)

  // Memoize the validation change handler to prevent infinite loops
  // This ensures the callback reference is stable across re-renders
  const handleValidationChange = React.useCallback(
    (isValid: boolean) => {
      onValidationChange(validationChangeIndex, isValid)
    },
    [onValidationChange, validationChangeIndex],
  )

  return (
    <View>
      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <View style={[a.flex_1]}>
          <AddressInputWithTransfer
            key={`address-input-${targetIndex}`}
            targetIndex={targetIndex}
            label={label}
            onValidationChange={handleValidationChange}
            ref={inputRef}
            testID={`receiverInput-${targetIndex}`}
          />
        </View>
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={[a.p_md, a.pl_md]}
            testID={`removeAddress-${targetIndex}`}
          >
            <Icon.Delete size={24} color={p.sys_magenta_500} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const SelectInputWalletsButton = ({
  selectedCount,
  onPress,
}: {
  selectedCount: number
  onPress: () => void
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        a.flex_row,
        a.align_center,
        a.justify_between,
        a.p_md,
        a.rounded_sm,
        a.border,
        {borderColor: p.primary_600, backgroundColor: p.gray_50},
      ]}
    >
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <Text style={[a.body_1_lg_medium, {color: p.primary_600}]}>
          {strings.send.selectInputWallets}
        </Text>
      </View>
      <View style={[a.flex_row, a.align_center, a.gap_xs]}>
        <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
          {selectedCount === 1
            ? strings.send.singleWallet
            : strings.send.multipleWallets(selectedCount)}
        </Text>
        <Icon.Chevron
          direction="right"
          color={ta.el_gray_max.color}
          size={20}
        />
      </View>
    </TouchableOpacity>
  )
}

const NextButton = Button

// Component to display a valid address as a card
const AddressCard = ({
  target,
  index,
  onEdit,
  onRemove,
}: {
  target: {
    receiver: {resolve: string; as: 'address' | 'domain'}
    entry: {address: string}
  }
  index: number
  onEdit: () => void
  onRemove?: () => void
}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  // Display the resolved address if available, otherwise the input (domain or address)
  const displayAddress =
    target.entry.address && target.entry.address.trim() !== ''
      ? target.entry.address
      : target.receiver.resolve

  // Format address for display (shorten if too long)
  const formattedAddress = truncateString({
    value: displayAddress,
    maxLength: 30,
  })

  return (
    <>
      <View
        style={[
          a.flex_row,
          a.align_center,
          a.justify_between,
          a.p_md,
          a.rounded_sm,
          a.border,
          {borderColor: p.gray_200, backgroundColor: p.gray_50},
        ]}
      >
        <TouchableOpacity
          onPress={onEdit}
          style={[a.flex_1, a.flex_row, a.align_center, a.gap_sm]}
        >
          <Icon.Check size={20} color={p.green_static} />
          <View style={[a.flex_1]}>
            <Text
              style={[a.body_2_md_regular, {color: p.gray_600}]}
              numberOfLines={1}
            >
              {strings.send.receiver} #{index + 1}
            </Text>
            <Text
              style={[a.body_2_md_medium, {color: p.gray_max}]}
              numberOfLines={1}
            >
              {formattedAddress}
            </Text>
          </View>
        </TouchableOpacity>
        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={[a.p_md, a.pl_md]}
            testID={`removeAddressCard-${index}`}
          >
            <Icon.Delete size={24} color={p.sys_magenta_500} />
          </TouchableOpacity>
        )}
      </View>
      <Space.Height.md />
    </>
  )
}
