/**
 * Select Multiple Wallets Modal
 * Allows selecting multiple wallets for multiparty transactions
 * Reuses existing WalletListItem component
 */
import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {useWalletManagerSelector, useWalletMetas} from '@yoroi/wallet-manager'

import * as React from 'react'
import {
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import {GestureHandlerRootView} from 'react-native-gesture-handler'

import {PendingActionBanner} from '~/features/Links/components/PendingActionBanner'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

// Removed WalletListItem import - using simplified display for multi-select

type Props = {
  onSelect: (selectedWalletIds: ReadonlyArray<string>) => void
  onCancel?: () => void
  selectedWalletIds?: ReadonlyArray<string>
  excludeWalletIds?: ReadonlyArray<string>
  minSelection?: number
  maxSelection?: number
  filter?: (walletMeta: Wallet.Meta) => boolean
  // For single selection mode (e.g., multisig parent wallet selection)
  singleSelection?: boolean
  // Wallet ID that cannot be unselected (e.g., the current/initiator wallet)
  requiredWalletId?: string
}

export const SelectMultipleWalletsModal = ({
  onSelect,
  onCancel: _onCancel,
  selectedWalletIds: initialSelectedWalletIds = [],
  excludeWalletIds = [],
  minSelection = 1,
  maxSelection,
  filter,
  singleSelection = false,
  requiredWalletId,
}: Props) => {
  const walletMetas = useWalletMetas()
  const {palette: p} = useTheme()
  const strings = useStrings()
  const [selectedWalletIds, setSelectedWalletIds] = React.useState<Set<string>>(
    new Set(initialSelectedWalletIds),
  )

  // Expose selected count to parent via callback ref pattern
  const selectedCountRef = React.useRef(selectedWalletIds.size)
  React.useEffect(() => {
    selectedCountRef.current = selectedWalletIds.size
  }, [selectedWalletIds])

  // Filter wallets
  const availableWallets = React.useMemo(() => {
    let filtered =
      walletMetas?.filter((meta) => !excludeWalletIds.includes(meta.id)) || []

    if (filter) {
      filtered = filtered.filter(filter)
    }

    return filtered
  }, [walletMetas, excludeWalletIds, filter])

  const handleToggleWallet = React.useCallback(
    (walletMeta: Wallet.Meta) => {
      setSelectedWalletIds((prev) => {
        if (singleSelection) {
          // Single selection: replace current selection
          if (prev.has(walletMeta.id)) {
            return new Set() // Deselect if already selected
          }
          return new Set([walletMeta.id]) // Select only this one
        }

        // Multiple selection: toggle
        const next = new Set(prev)
        if (next.has(walletMeta.id)) {
          // Prevent unselecting the required wallet (e.g., current/initiator wallet)
          if (requiredWalletId && walletMeta.id === requiredWalletId) {
            return prev // Don't allow unselecting the required wallet
          }
          next.delete(walletMeta.id)
        } else {
          // Check max selection limit
          if (maxSelection && next.size >= maxSelection) {
            return prev // Don't add if max reached
          }
          next.add(walletMeta.id)
        }
        return next
      })
    },
    [maxSelection, singleSelection, requiredWalletId],
  )

  const handleConfirm = React.useCallback(() => {
    const selected = Array.from(selectedWalletIds)
    if (selected.length >= minSelection) {
      onSelect(selected)
    }
  }, [selectedWalletIds, minSelection, onSelect])

  const canConfirm = selectedWalletIds.size >= minSelection
  const selectedCount = selectedWalletIds.size

  // For single selection, minSelection should be 0 or 1
  const effectiveMinSelection = singleSelection
    ? Math.min(minSelection, 1)
    : minSelection

  const walletList = React.useMemo(
    () =>
      availableWallets?.map((walletMeta) => {
        const isSelected = selectedWalletIds.has(walletMeta.id)
        const isRequired = requiredWalletId === walletMeta.id

        return (
          <React.Fragment key={walletMeta.id}>
            <MultiSelectWalletItem
              walletMeta={walletMeta}
              isSelected={isSelected}
              isRequired={isRequired}
              onToggle={handleToggleWallet}
            />
            <Space.Height.lg />
          </React.Fragment>
        )
      }),
    [availableWallets, selectedWalletIds, handleToggleWallet, requiredWalletId],
  )

  // Expose footer props via context or callback
  React.useEffect(() => {
    // This will be handled by the parent modal hook
  }, [selectedCount, canConfirm])

  return (
    <>
      <Modal.Content>
        <GestureHandlerRootView style={[a.flex_1]}>
          <PendingActionBanner />
          <Space.Height.lg />

          {maxSelection && (
            <View style={[a.px_lg, a.pb_md]}>
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {strings.send.selectUpToWallets(maxSelection)} ({selectedCount}/
                {maxSelection})
              </Text>
            </View>
          )}

          <ScrollView style={[a.px_lg]}>{walletList}</ScrollView>
        </GestureHandlerRootView>
      </Modal.Content>
      <SelectMultipleWalletsModalFooter
        onConfirm={handleConfirm}
        onCancel={_onCancel}
        selectedCount={selectedCount}
        minSelection={effectiveMinSelection}
        singleSelection={singleSelection}
      />
    </>
  )
}

type MultiSelectWalletItemProps = {
  walletMeta: Wallet.Meta
  isSelected: boolean
  isRequired?: boolean
  onToggle: (walletMeta: Wallet.Meta) => void
}

const MultiSelectWalletItem = ({
  walletMeta,
  isSelected,
  isRequired = false,
  onToggle,
}: MultiSelectWalletItemProps) => {
  const {palette: p, atoms: ta} = useTheme()

  const implementationName = React.useMemo(() => {
    if (walletMeta.implementation === 'cardano-multisig') return 'Multisig'
    return walletMeta.implementation
  }, [walletMeta.implementation])

  const isDisabled = isRequired && isSelected

  return (
    <TouchableOpacity
      onPress={() => !isDisabled && onToggle(walletMeta)}
      disabled={isDisabled}
      style={[
        a.flex_row,
        a.align_center,
        a.p_md,
        a.rounded_sm,
        a.border,
        isSelected
          ? {borderColor: p.primary_600, backgroundColor: p.primary_100}
          : {borderColor: p.gray_200, backgroundColor: 'transparent'},
        isDisabled && {opacity: 0.6},
      ]}
    >
      <Icon.WalletAvatar image={walletMeta.avatar} />

      <Space.Width.md />

      <View style={[a.justify_between, a.flex_1]}>
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <Text
            style={[a.flex_1, a.body_1_lg_medium, ta.text_gray_max]}
            numberOfLines={1}
          >
            {walletMeta.name}
          </Text>
        </View>

        <Text style={[ta.text_gray_low]}>
          {`${walletMeta.plate} | ${implementationName}`}
        </Text>
      </View>

      {walletMeta.multisigMeta && (
        <>
          <View
            style={[
              a.px_xs,
              a.py_xs,
              {backgroundColor: p.primary_100},
              a.rounded_xs,
            ]}
          >
            <Text style={[a.body_2_md_medium, {color: p.primary_600}]}>
              {walletMeta.multisigMeta.coSigners.length}-of-
              {walletMeta.multisigMeta.quorumRules.kind === 'RequireNOf'
                ? walletMeta.multisigMeta.quorumRules.required ||
                  walletMeta.multisigMeta.coSigners.length
                : walletMeta.multisigMeta.quorumRules.kind === 'RequireAllOf'
                  ? walletMeta.multisigMeta.coSigners.length
                  : 1}
            </Text>
          </View>
          <Space.Width.md />
        </>
      )}

      {walletMeta.isReadOnly && (
        <>
          <Icon.EyeOn size={24} color={p.el_gray_min} />
          <Space.Width.md />
        </>
      )}

      <Space.Width.md />

      {isSelected ? (
        <Icon.CheckFilled size={24} color={p.primary_600} />
      ) : (
        <View
          style={[
            {width: 24, height: 24},
            a.rounded_full,
            a.border,
            {borderColor: p.gray_300},
          ]}
        />
      )}
    </TouchableOpacity>
  )
}

type SelectMultipleWalletsModalFooterProps = {
  onConfirm: () => void
  onCancel?: () => void
  selectedCount: number
  minSelection: number
  singleSelection?: boolean
}

const SelectMultipleWalletsModalFooter = ({
  onConfirm,
  onCancel,
  selectedCount,
  minSelection,
  singleSelection = false,
}: SelectMultipleWalletsModalFooterProps) => {
  const strings = useStrings()
  const {markActionProcessed} = useLinks()
  const {closeModal} = useModal()

  const canConfirm = selectedCount >= minSelection

  const handleCancel = () => {
    markActionProcessed()
    closeModal()
    onCancel?.()
  }

  return (
    <Modal.Footer>
      <View style={[a.p_lg, a.flex_row, a.justify_between, a.gap_md]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleCancel}
          title={strings.global.cancel}
        />
        <Button
          size="S"
          onPress={onConfirm}
          disabled={!canConfirm}
          title={
            canConfirm
              ? singleSelection
                ? strings.global.proceed
                : strings.global.ok
              : strings.send.selectAtLeastWallets(minSelection)
          }
        />
      </View>
    </Modal.Footer>
  )
}

export const useSelectMultipleWalletsModal = () => {
  const {openModal, closeModal} = useModal()
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const strings = useStrings()
  const {height: windowHeight} = useWindowDimensions()

  const open = React.useCallback(
    ({
      onSelect,
      onCancel,
      selectedWalletIds,
      excludeWalletIds,
      minSelection = 1,
      maxSelection,
      filter,
      singleSelection = false,
      title,
      requiredWalletId,
    }: {
      onSelect: (selectedWalletIds: ReadonlyArray<string>) => void
      onCancel?: () => void
      selectedWalletIds?: ReadonlyArray<string>
      excludeWalletIds?: ReadonlyArray<string>
      minSelection?: number
      maxSelection?: number
      filter?: (walletMeta: Wallet.Meta) => boolean
      singleSelection?: boolean
      title?: string
      requiredWalletId?: string
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }

      openModal({
        title: title ?? strings.send.selectInputWallets,
        content: (
          <SelectMultipleWalletsModal
            onSelect={(selected) => {
              if (selected.length >= (minSelection || 1)) {
                closeModal()
                onSelect(selected)
              }
            }}
            onCancel={onCancel}
            selectedWalletIds={selectedWalletIds}
            excludeWalletIds={excludeWalletIds}
            minSelection={minSelection}
            maxSelection={maxSelection}
            filter={filter}
            singleSelection={singleSelection}
            requiredWalletId={requiredWalletId}
          />
        ),
        height: Math.min(windowHeight * 0.85, 700),
        canDiscard: true,
        onClose: onCancel,
      })
    },
    [openModal, closeModal, walletManager, strings, windowHeight],
  )

  return {openSelectMultipleWalletsModal: open, closeModal}
}
