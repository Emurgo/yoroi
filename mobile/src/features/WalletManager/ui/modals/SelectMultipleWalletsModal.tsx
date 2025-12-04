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
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'

import {WalletListItem} from '../screens/SelectWalletFromListScreen/WalletListItem'

type Props = {
  onSelect: (selectedWalletIds: ReadonlyArray<string>) => void
  onCancel?: () => void
  selectedWalletIds?: ReadonlyArray<string>
  excludeWalletIds?: ReadonlyArray<string>
  minSelection?: number
  maxSelection?: number
  filter?: (walletMeta: Wallet.Meta) => boolean
}

export const SelectMultipleWalletsModal = ({
  onSelect,
  onCancel: _onCancel,
  selectedWalletIds: initialSelectedWalletIds = [],
  excludeWalletIds = [],
  minSelection = 1,
  maxSelection,
  filter,
}: Props) => {
  const walletMetas = useWalletMetas()
  const {atoms: ta} = useTheme()
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
        const next = new Set(prev)
        if (next.has(walletMeta.id)) {
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
    [maxSelection],
  )

  const handleConfirm = React.useCallback(() => {
    const selected = Array.from(selectedWalletIds)
    if (selected.length >= minSelection) {
      onSelect(selected)
    }
  }, [selectedWalletIds, minSelection, onSelect])

  const canConfirm = selectedWalletIds.size >= minSelection
  const selectedCount = selectedWalletIds.size

  const walletList = React.useMemo(
    () =>
      availableWallets?.map((walletMeta) => {
        const isSelected = selectedWalletIds.has(walletMeta.id)

        return (
          <React.Fragment key={walletMeta.id}>
            <MultiSelectWalletItem
              walletMeta={walletMeta}
              isSelected={isSelected}
              onToggle={handleToggleWallet}
            />
            <Space.Height.lg />
          </React.Fragment>
        )
      }),
    [availableWallets, selectedWalletIds, handleToggleWallet],
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
              <Text style={[ta.body_2_md_regular, ta.text_gray_low]}>
                {strings.send.selectUpToWallets ||
                  `Select up to ${maxSelection} wallets`}{' '}
                ({selectedCount}/{maxSelection})
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
        minSelection={minSelection}
      />
    </>
  )
}

type MultiSelectWalletItemProps = {
  walletMeta: Wallet.Meta
  isSelected: boolean
  onToggle: (walletMeta: Wallet.Meta) => void
}

const MultiSelectWalletItem = ({
  walletMeta,
  isSelected,
  onToggle,
}: MultiSelectWalletItemProps) => {
  const {atoms: ta, palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={() => onToggle(walletMeta)}
      style={[
        a.flex_row,
        a.align_center,
        a.p_md,
        a.rounded_sm,
        a.border,
        isSelected
          ? {borderColor: ta.primary.color, backgroundColor: p.primary_50}
          : {borderColor: ta.gray_c200.color, backgroundColor: 'transparent'},
      ]}
    >
      <View style={[a.flex_1]}>
        <WalletListItem
          walletMeta={walletMeta}
          onPress={() => onToggle(walletMeta)}
        />
      </View>

      <Space.Width.md />

      {isSelected ? (
        <Icon.CheckCircle size={24} color={p.primary_600} />
      ) : (
        <View
          style={[
            {width: 24, height: 24},
            a.rounded_full,
            a.border,
            {borderColor: ta.gray_c300.color},
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
}

const SelectMultipleWalletsModalFooter = ({
  onConfirm,
  onCancel,
  selectedCount,
  minSelection,
}: SelectMultipleWalletsModalFooterProps) => {
  const strings = useStrings()
  const {markActionProcessed} = useLinks()
  const {closeModal} = useModal()
  const walletNavigation = useWalletNavigation()

  const canConfirm = selectedCount >= minSelection

  const handleCancel = () => {
    markActionProcessed()
    closeModal()
    onCancel?.()
    walletNavigation.resetToWalletSelection()
  }

  return (
    <Modal.Footer>
      <Button
        size="S"
        type={ButtonType.Secondary}
        onPress={handleCancel}
        title={strings.global.cancel}
      />
      <Space.Width.md />
      <Button
        size="S"
        onPress={onConfirm}
        disabled={!canConfirm}
        title={
          canConfirm
            ? strings.global.confirm || 'Confirm'
            : strings.send.selectAtLeastWallets?.replace(
                '{count}',
                String(minSelection),
              ) || `Select at least ${minSelection} wallet(s)`
        }
      />
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
    }: {
      onSelect: (selectedWalletIds: ReadonlyArray<string>) => void
      onCancel?: () => void
      selectedWalletIds?: ReadonlyArray<string>
      excludeWalletIds?: ReadonlyArray<string>
      minSelection?: number
      maxSelection?: number
      filter?: (walletMeta: Wallet.Meta) => boolean
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }

      openModal({
        title:
          strings.send.selectInputWallets ||
          'Select Input Wallets for Multiparty Transaction',
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
