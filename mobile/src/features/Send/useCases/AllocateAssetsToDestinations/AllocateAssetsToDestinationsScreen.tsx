/**
 * Allocate Assets to Destinations Screen
 * Allows users to allocate assets from multiple input wallets to multiple destination addresses
 */
import {Quantities} from '@yoroi/cardano-wallet'
import {atomicBreakdown, truncateString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {NotEnoughMoneyToSendError, TransactionOutput} from '@yoroi/tx'
import {Address, Portfolio} from '@yoroi/types'
import {useSelectedWallet, useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native'

import {usePromise} from '~/common/hooks/usePromise'
import {useMultipartySend} from '~/features/Send/common/context/MultipartySendContext'
import {toTransactionOutput} from '~/features/Send/common/toTransactionOutput'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Accordion} from '~/ui/Accordion/Accordion'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

// Track allocations per target: Map<targetIndex, Map<tokenId, quantity>>
type Allocations = Map<number, Map<Portfolio.Token.Id, bigint>>

export const AllocateAssetsToDestinationsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation()
  const resultNavigation = useResultNavigation()
  const {navigateToTxReview, resetToStartTransfer} = useWalletNavigation()
  const {openModal, closeModal} = useModal()

  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {selectedInputWalletIds, getWalletAssets} = useMultipartySend()
  const {targets} = useTransfer()

  // Aggregate all assets from all input wallets
  const allAssets = React.useMemo(() => {
    const aggregated: Map<Portfolio.Token.Id, Portfolio.Token.Amount> =
      new Map()
    selectedInputWalletIds.forEach((walletId) => {
      const walletAssets = getWalletAssets(walletId)
      walletAssets.forEach((amount, tokenId) => {
        const existing = aggregated.get(tokenId)
        if (existing) {
          aggregated.set(tokenId, {
            ...existing,
            quantity: existing.quantity + amount.quantity,
          })
        } else {
          aggregated.set(tokenId, amount)
        }
      })
    })
    return Array.from(aggregated.values())
  }, [selectedInputWalletIds, getWalletAssets])

  // Track allocations per target
  const [allocations, setAllocations] = React.useState<Allocations>(new Map())

  // Track expanded state for destination accordions
  const [expandedTargets, setExpandedTargets] = React.useState<
    Map<number, boolean>
  >(new Map())

  // Initialize first target as expanded
  React.useEffect(() => {
    if (targets.length > 0 && !expandedTargets.has(0)) {
      setExpandedTargets((prev) => new Map(prev).set(0, true))
    }
  }, [targets.length, expandedTargets])

  // Get total allocated quantity for a token across all targets
  const getTotalAllocated = React.useCallback(
    (tokenId: Portfolio.Token.Id): bigint => {
      let total = BigInt(0)
      allocations.forEach((targetAllocations) => {
        total += targetAllocations.get(tokenId) ?? BigInt(0)
      })
      return total
    },
    [allocations],
  )

  // Get remaining quantity for a token (total - allocated)
  const getRemaining = React.useCallback(
    (tokenId: Portfolio.Token.Id): bigint => {
      const asset = allAssets.find((a) => a.info.id === tokenId)
      if (!asset) return BigInt(0)
      return asset.quantity - getTotalAllocated(tokenId)
    },
    [allAssets, getTotalAllocated],
  )

  // Get allocated quantity for a token in a specific target
  const getAllocatedForTarget = React.useCallback(
    (targetIndex: number, tokenId: Portfolio.Token.Id): bigint => {
      return allocations.get(targetIndex)?.get(tokenId) ?? BigInt(0)
    },
    [allocations],
  )

  // Update allocation for a token in a target
  const updateAllocation = React.useCallback(
    (targetIndex: number, tokenId: Portfolio.Token.Id, quantity: bigint) => {
      setAllocations((prev) => {
        const updated = new Map(prev)
        const targetAllocations = updated.get(targetIndex) ?? new Map()
        const updatedTarget = new Map(targetAllocations)
        if (quantity === BigInt(0)) {
          updatedTarget.delete(tokenId)
        } else {
          updatedTarget.set(tokenId, quantity)
        }
        updated.set(targetIndex, updatedTarget)
        return updated
      })
    },
    [],
  )

  const handleToggleTarget = React.useCallback((targetIndex: number) => {
    setExpandedTargets((prev) => {
      const updated = new Map(prev)
      updated.set(targetIndex, !(updated.get(targetIndex) ?? false))
      return updated
    })
  }, [])

  const handleEditAllocation = React.useCallback(
    (targetIndex: number, tokenId: Portfolio.Token.Id) => {
      const asset = allAssets.find((a) => a.info.id === tokenId)
      if (!asset) return

      const currentAllocated = getAllocatedForTarget(targetIndex, tokenId)
      const remaining = getRemaining(tokenId) + currentAllocated

      openModal({
        title: strings.send.amount,
        content: (
          <EditAllocationContent
            targetIndex={targetIndex}
            tokenId={tokenId}
            asset={asset}
            currentAllocated={currentAllocated}
            remaining={remaining}
            onSave={(quantity) => {
              updateAllocation(targetIndex, tokenId, quantity)
              closeModal()
            }}
          />
        ),
        canDiscard: true,
        height: 400,
      })
    },
    [
      allAssets,
      getAllocatedForTarget,
      getRemaining,
      openModal,
      closeModal,
      strings,
      updateAllocation,
    ],
  )

  // Build transaction entries from allocations
  const createUnsignedTxPromise = React.useCallback(
    async (entries: TransactionOutput[]) => {
      try {
        const isMultiparty = selectedInputWalletIds.length > 1

        logger.info(
          'AllocateAssetsToDestinationsScreen: Creating transaction',
          {
            isMultiparty,
            inputWalletCount: selectedInputWalletIds.length,
            entriesCount: entries.length,
          },
        )

        if (!walletManager) {
          throw new Error('WalletManager not available')
        }

        if (isMultiparty) {
          const {createMultipartySendTxFromWallets} = await import(
            '@yoroi/cardano-wallet'
          )
          const result = await createMultipartySendTxFromWallets({
            walletManager,
            inputWalletIds: selectedInputWalletIds,
            entries,
            addressMode: meta.addressMode,
            subtractFeeFromAmount: false,
          })

          return {
            cbor: result.cbor,
            multiparty: {
              requiredSigners: result.requiredSigners,
            },
          }
        } else {
          const {createSendTxFromWallet} = await import('@yoroi/cardano-wallet')
          const result = await createSendTxFromWallet(wallet, {
            entries,
            addressMode: meta.addressMode,
            subtractFeeFromAmount: false,
          })
          return result
        }
      } catch (error) {
        logger.error(
          'AllocateAssetsToDestinationsScreen: createTransaction failed',
          {
            error: error instanceof Error ? error.message : String(error),
            entriesCount: entries.length,
            isMultiparty: selectedInputWalletIds.length > 1,
          },
        )
        throw error
      }
    },
    [wallet, walletManager, selectedInputWalletIds, meta.addressMode],
  )

  const handleCreateUnsignedTxSuccess = React.useCallback(
    (result: {
      cbor: string
      multiparty?: {
        requiredSigners: ReadonlyArray<{
          readonly walletId: string
          readonly keyHash: string
          readonly walletName: string
        }>
      }
    }) => {
      navigateToTxReview({
        cbor: result.cbor,
        multiparty: result.multiparty
          ? {
              requiredSigners: result.multiparty.requiredSigners,
              inputWalletIds: selectedInputWalletIds,
            }
          : undefined,
        onSuccess: () => {
          navigation.goBack()
        },
        context: 'send',
      })
    },
    [navigateToTxReview, selectedInputWalletIds, navigation],
  )

  const handleCreateUnsignedTxError = React.useCallback(
    (error: Error) => {
      if (
        error instanceof NotEnoughMoneyToSendError ||
        isInsufficientBalanceError(error)
      ) {
        logger.info(
          'AllocateAssetsToDestinationsScreen: Insufficient balance error',
          {
            errorMessage: error.message,
          },
        )
        resultNavigation.showResultScreen({
          type: 'error',
          context: 'send',
          title: strings.send.noBalance,
          message: strings.send.failedTxText,
          primaryAction: {
            title: strings.send.failedTxButton,
            onPress: resetToStartTransfer,
          },
        })
        return
      }
      throw error
    },
    [resultNavigation, strings, resetToStartTransfer],
  )

  const {resolve: createUnsignedTx, isPending} = usePromise({
    promise: createUnsignedTxPromise,
    onSuccess: handleCreateUnsignedTxSuccess,
    onError: handleCreateUnsignedTxError,
  })

  const handleOnNext = React.useCallback(() => {
    // Build transaction entries from allocations
    const entries: TransactionOutput[] = targets.map((target, targetIndex) => {
      const targetAllocations = allocations.get(targetIndex) ?? new Map()
      const amounts: Record<Portfolio.Token.Id, Portfolio.Token.Amount> = {}

      targetAllocations.forEach((quantity, tokenId) => {
        const asset = allAssets.find((a) => a.info.id === tokenId)
        if (asset && quantity > BigInt(0)) {
          amounts[tokenId] = {
            info: asset.info,
            quantity,
          }
        }
      })

      // Validate address - only use resolved address, never unresolved domains
      const isDomain = target.receiver.as === 'domain'
      const resolvedAddress =
        target.entry.address && target.entry.address.trim() !== ''
          ? target.entry.address
          : null

      // For domains, we MUST have a resolved address
      if (isDomain && !resolvedAddress) {
        throw new Error(
          `Domain "${target.receiver.resolve}" failed to resolve for target at index ${targetIndex}`,
        )
      }

      // For direct addresses, use entry.address if available, otherwise use receiver.resolve
      const address =
        resolvedAddress ??
        (target.receiver.resolve && !isDomain ? target.receiver.resolve : null)

      if (!address || address.trim() === '') {
        throw new Error(`Invalid address for target at index ${targetIndex}`)
      }

      return toTransactionOutput({
        address: address as Address,
        amounts,
        datum: target.entry.datum,
      })
    })

    createUnsignedTx(entries)
  }, [targets, allocations, allAssets, createUnsignedTx])

  // Check if all assets are allocated (optional - can proceed with partial allocation)
  const hasAllocations = React.useMemo(() => {
    return (
      allocations.size > 0 &&
      Array.from(allocations.values()).some(
        (targetAllocations) => targetAllocations.size > 0,
      )
    )
  }, [allocations])

  return (
    <SafeArea>
      <ScrollView
        style={[a.flex_1]}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
          {strings.send.allocateAssetsDescription(targets.length)}
        </Text>
        <Space.Height.xl />

        {/* Show total assets available */}
        <View
          style={[
            a.p_md,
            a.rounded_sm,
            a.border,
            {borderColor: p.gray_200, backgroundColor: p.gray_50},
          ]}
        >
          <Text style={[a.body_2_md_medium, {color: p.gray_600}]}>
            {strings.send.totalAssetsAvailable}
          </Text>
          <Space.Height.sm />
          {allAssets.length > 0 ? (
            allAssets.map((asset) => (
              <View key={asset.info.id} style={[a.pb_xs]}>
                <TokenAmountItem amount={asset} ignorePrivacy />
              </View>
            ))
          ) : (
            <Text style={[a.body_2_md_regular, {color: p.gray_500}]}>
              {strings.send.noAssetsAdded}
            </Text>
          )}
        </View>

        <Space.Height.lg />

        {/* Show destinations with allocations */}
        <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
          {strings.send.destinations}
        </Text>
        <Space.Height.md />

        {targets.map((target, targetIndex) => {
          const isExpanded = expandedTargets.get(targetIndex) ?? false
          const targetAllocations = allocations.get(targetIndex) ?? new Map()
          const allocatedAssets = Array.from(targetAllocations.entries())
            .map(([tokenId, quantity]) => {
              const asset = allAssets.find((a) => a.info.id === tokenId)
              return asset
                ? {
                    ...asset,
                    quantity,
                  }
                : null
            })
            .filter((asset): asset is Portfolio.Token.Amount => asset !== null)

          const displayAddress =
            target.entry.address && target.entry.address.trim() !== ''
              ? target.entry.address
              : target.receiver.resolve

          return (
            <React.Fragment key={targetIndex}>
              <Accordion
                label={`${strings.send.receiver} ${targetIndex + 1}`}
                expanded={isExpanded}
                onChange={() => handleToggleTarget(targetIndex)}
              >
                <Space.Height.md />
                <View style={[a.px_lg]}>
                  <Text
                    style={[a.body_2_md_regular, {color: p.gray_600}]}
                    numberOfLines={1}
                  >
                    {truncateString({value: displayAddress, maxLength: 40})}
                  </Text>
                  <Space.Height.md />

                  {allocatedAssets.length > 0 ? (
                    <>
                      {allocatedAssets.map((asset) => {
                        const allocated = getAllocatedForTarget(
                          targetIndex,
                          asset.info.id,
                        )

                        return (
                          <AllocationItem
                            key={asset.info.id}
                            asset={asset}
                            allocated={allocated}
                            onEdit={() =>
                              handleEditAllocation(targetIndex, asset.info.id)
                            }
                            onRemove={() =>
                              updateAllocation(
                                targetIndex,
                                asset.info.id,
                                BigInt(0),
                              )
                            }
                          />
                        )
                      })}
                    </>
                  ) : (
                    <Text style={[a.body_2_md_regular, {color: p.gray_500}]}>
                      {strings.send.noAssetsAllocated}
                    </Text>
                  )}

                  <Space.Height.md />

                  {/* Show remaining assets that can be allocated */}
                  {(() => {
                    const availableAssets = allAssets.filter((asset) => {
                      const remaining = getRemaining(asset.info.id)
                      return remaining > BigInt(0)
                    })

                    if (availableAssets.length === 0) return null

                    return (
                      <View
                        style={[a.pt_md, a.border_t, {borderColor: p.gray_200}]}
                      >
                        <Text style={[a.body_2_md_medium, {color: p.gray_600}]}>
                          {strings.send.availableToAllocate}
                        </Text>
                        <Space.Height.sm />
                        {availableAssets.map((asset) => {
                          const remaining = getRemaining(asset.info.id)
                          return (
                            <TouchableOpacity
                              key={asset.info.id}
                              onPress={() =>
                                handleEditAllocation(targetIndex, asset.info.id)
                              }
                              style={[a.py_xs]}
                            >
                              <View
                                style={[a.flex_row, a.align_center, a.gap_sm]}
                              >
                                <Icon.Plus size={16} color={p.primary_600} />
                                <TokenAmountItem
                                  amount={{
                                    ...asset,
                                    quantity: remaining,
                                  }}
                                  ignorePrivacy
                                />
                              </View>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    )
                  })()}
                </View>
                <Space.Height.md />
              </Accordion>
              <Space.Height.md />
            </React.Fragment>
          )
        })}
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleOnNext}
          title={strings.send.next}
          disabled={!hasAllocations || isPending}
          isLoading={isPending}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

type EditAllocationContentProps = {
  targetIndex: number
  tokenId: Portfolio.Token.Id
  asset: Portfolio.Token.Amount
  currentAllocated: bigint
  remaining: bigint
  onSave: (quantity: bigint) => void
}

const EditAllocationContent = ({
  asset,
  currentAllocated,
  remaining,
  onSave,
}: EditAllocationContentProps) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {numberLocale} = useLanguage()
  const {closeModal} = useModal()

  const [quantity, setQuantity] = React.useState(currentAllocated)
  const [inputValue, setInputValue] = React.useState(
    currentAllocated === BigInt(0)
      ? ''
      : atomicBreakdown(currentAllocated, asset.info.decimals ?? 0).str,
  )

  const textInputRef = React.useRef<TextInput>(null)

  const handleOnChangeQuantity = React.useCallback(
    (text: string) => {
      try {
        const [input, parsedQuantity] = Quantities.parseFromText(
          text,
          asset.info.decimals ?? 0,
          numberLocale,
        )

        setInputValue(input)
        const newQuantity = BigInt(parsedQuantity)

        // Validate: can't allocate more than remaining + current allocated
        if (newQuantity <= remaining) {
          setQuantity(newQuantity)
        } else {
          // Set to max available
          setQuantity(remaining)
          setInputValue(
            atomicBreakdown(remaining, asset.info.decimals ?? 0).str,
          )
        }
      } catch (error) {
        logger.error(
          'EditAllocationContent: handleOnChangeQuantity error parsing input',
          {error},
        )
      }
    },
    [asset.info.decimals, numberLocale, remaining],
  )

  const handleOnMax = React.useCallback(() => {
    setInputValue(atomicBreakdown(remaining, asset.info.decimals ?? 0).str)
    setQuantity(remaining)
  }, [asset.info.decimals, remaining])

  const handleOnApply = React.useCallback(() => {
    onSave(quantity)
  }, [quantity, onSave])

  const isValid = quantity >= BigInt(0) && quantity <= remaining

  return (
    <Modal.Content>
      <ScrollView
        contentContainerStyle={[a.px_lg, a.pb_lg]}
        showsVerticalScrollIndicator={false}
      >
        <Space.Height.lg />
        <TokenAmountItem
          amount={{
            ...asset,
            quantity: remaining,
          }}
          ignorePrivacy
        />

        <Space.Height.xl />

        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <TextInput
            ref={textInputRef}
            value={inputValue}
            onChangeText={handleOnChangeQuantity}
            placeholder="0"
            keyboardType="decimal-pad"
            style={[
              a.flex_1,
              a.p_md,
              a.border,
              a.rounded_sm,
              {borderColor: p.gray_300},
              ta.text_gray_max,
            ]}
          />
          <TouchableOpacity
            onPress={handleOnMax}
            style={[
              a.px_md,
              a.py_md,
              a.rounded_sm,
              {backgroundColor: p.primary_100},
            ]}
          >
            <Text style={[a.body_2_md_medium, {color: p.primary_600}]}>
              {strings.send.max}
            </Text>
          </TouchableOpacity>
        </View>

        {quantity > remaining && (
          <Text
            style={[a.body_2_md_regular, {color: p.sys_magenta_500}, a.pt_sm]}
          >
            {strings.send.noBalance}
          </Text>
        )}
      </ScrollView>

      <Modal.Footer>
        <View style={[a.flex_row, a.gap_md, a.justify_end]}>
          <Button
            type={ButtonType.Secondary}
            onPress={closeModal}
            title={strings.global.cancel}
          />
          <Button
            type={ButtonType.Primary}
            onPress={handleOnApply}
            disabled={!isValid}
            title={strings.global.ok}
          />
        </View>
      </Modal.Footer>
    </Modal.Content>
  )
}

type AllocationItemProps = {
  asset: Portfolio.Token.Amount
  allocated: bigint
  onEdit: () => void
  onRemove: () => void
}

const AllocationItem = ({
  asset,
  allocated,
  onEdit,
  onRemove,
}: AllocationItemProps) => {
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.justify_between,
        a.p_md,
        a.rounded_sm,
        a.border,
        {borderColor: p.gray_200, backgroundColor: p.gray_50},
        a.pb_sm,
      ]}
    >
      <TouchableOpacity
        onPress={onEdit}
        style={[
          a.flex_1,
          a.flex_row,
          a.align_center,
          a.gap_sm,
          {minWidth: 0, flexShrink: 1},
        ]}
      >
        <View style={[a.flex_shrink, {minWidth: 0, flex: 1}]}>
          <TokenAmountItem
            amount={{
              ...asset,
              quantity: allocated,
            }}
            ignorePrivacy
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} style={[a.pl_md]}>
        <Icon.Delete size={20} color={p.sys_magenta_500} />
      </TouchableOpacity>
    </View>
  )
}
