import {
  createMultipartySendTxFromWallets,
  createSendTxFromWallet,
} from '@yoroi/cardano-wallet'
import {isNft, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {NotEnoughMoneyToSendError, TransactionOutput} from '@yoroi/tx'
import {Address, Branded, Portfolio} from '@yoroi/types'
import {useSelectedWallet, useWalletManager} from '@yoroi/wallet-manager'

import * as CSL from '@emurgo/cross-csl-core'
import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {usePromise} from '~/common/hooks/usePromise'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {useSearch} from '~/features/Search/SearchContext'
import {useMultipartySend} from '~/features/Send/common/context/MultipartySendContext'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {toTransactionOutput} from '~/features/Send/common/toTransactionOutput'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {BackButton} from '~/kernel/navigation/common/helpers'
import {useResultNavigation} from '~/kernel/navigation/hooks/useResultNavigation'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Accordion} from '~/ui/Accordion/Accordion'
import {AddTokenButton} from '~/ui/AddTokenButton/AddTokenButton'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {RemoveAmountButton} from '~/ui/RemoveAmountButton/RemoveAmountButton'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

export const ListAmountsToSendScreen = () => {
  const navigateTo = useNavigateTo()
  const resultNavigation = useResultNavigation()
  const {navigateToTxReview, resetToStartTransfer} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {wallet} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {palette: p} = useTheme()
  const {
    selectedInputWalletIds,
    selectedWalletForAssets,
    setSelectedWalletForAssets,
    getWalletAssets,
    removeWalletAsset,
  } = useMultipartySend()
  const {targets, selectedTargetIndex, tokenSelectedChanged, reset, allocated} =
    useTransfer()

  // Track expanded state for wallet accordions
  const [expandedWallets, setExpandedWallets] = React.useState<
    Map<string, boolean>
  >(new Map())

  // Initialize all selected wallets as expanded
  React.useEffect(() => {
    if (selectedInputWalletIds.length > 0) {
      setExpandedWallets((prev) => {
        const updated = new Map(prev)
        selectedInputWalletIds.forEach((walletId) => {
          if (!updated.has(walletId)) {
            updated.set(walletId, true)
          }
        })
        return updated
      })
    }
    // If multiple wallets and no wallet selected for assets, select current wallet
    if (
      selectedInputWalletIds.length > 1 &&
      selectedWalletForAssets === null &&
      selectedInputWalletIds.includes(wallet.id)
    ) {
      setSelectedWalletForAssets(wallet.id)
    }
  }, [
    wallet.id,
    selectedInputWalletIds,
    selectedWalletForAssets,
    setSelectedWalletForAssets,
  ])

  const isMultipleWallets = selectedInputWalletIds.length > 1

  // For single wallet, use transfer state amounts (backward compatibility)
  // For multiple wallets, use per-wallet assets from context
  const selectedTarget = targets[selectedTargetIndex]
  const amounts = React.useMemo(() => {
    if (!isMultipleWallets) {
      // Single wallet: use transfer state
      const targetAmounts: Record<Portfolio.Token.Id, Portfolio.Token.Amount> =
        selectedTarget?.entry.amounts ?? {}
      if (!selectedTarget) return {}
      return targetAmounts
    } else {
      // Multiple wallets: aggregate all wallet assets
      const aggregated: Record<Portfolio.Token.Id, Portfolio.Token.Amount> = {}
      selectedInputWalletIds.forEach((walletId) => {
        const walletAssets = getWalletAssets(walletId)
        walletAssets.forEach((amount, tokenId) => {
          // If token already exists, sum quantities (for same token across wallets)
          if (aggregated[tokenId]) {
            aggregated[tokenId] = {
              ...aggregated[tokenId],
              quantity: aggregated[tokenId].quantity + amount.quantity,
            }
          } else {
            aggregated[tokenId] = amount
          }
        })
      })
      return aggregated
    }
  }, [
    isMultipleWallets,
    selectedTarget,
    selectedInputWalletIds,
    getWalletAssets,
  ])

  const selectedTokensCounter = Object.keys(amounts).length
  const {
    meta: {addressMode},
  } = useSelectedWallet()

  // Check if MAX amount is being sent for primary token
  const balances = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  const primaryAmount = amounts[primaryTokenId]
  const isSendingMaxAda = React.useMemo(() => {
    if (!primaryAmount || !isPrimaryToken(primaryAmount.info)) return false

    const available =
      (balances.records.get(primaryTokenId)?.quantity ?? BigInt(0)) -
      (allocated.get(selectedTargetIndex)?.get(primaryTokenId) ?? BigInt(0))
    const spendable = available - primaryBreakdown.lockedAsStorageCost

    // Check if the amount equals spendable (MAX was used)
    const isMax = primaryAmount.quantity === spendable && spendable > BigInt(0)

    logger.info('ListAmountsToSendScreen: MAX detection', {
      primaryAmount: primaryAmount.quantity.toString(),
      available: available.toString(),
      lockedAsStorageCost: primaryBreakdown.lockedAsStorageCost.toString(),
      spendable: spendable.toString(),
      isSendingMaxAda: isMax,
    })

    return isMax
  }, [
    primaryAmount,
    balances,
    primaryBreakdown.lockedAsStorageCost,
    primaryTokenId,
    selectedTargetIndex,
    allocated,
  ])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <BackButton
          onPress={() => {
            navigateTo.startTxAfterReset()
          }}
        />
      ),
    })
  }, [navigation, navigateTo])

  const handleOnEdit = (tokenId: Portfolio.Token.Id, walletId?: string) => {
    const amount =
      isMultipleWallets && walletId
        ? getWalletAssets(walletId).get(tokenId)
        : amounts[tokenId]
    if (!amount) return
    if (isNft(amount.info)) return

    tokenSelectedChanged(tokenId)
    navigateTo.editAmount(amount)
  }

  const handleOnRemove = (tokenId: Portfolio.Token.Id, walletId?: string) => {
    if (isMultipleWallets && walletId) {
      // Remove from specific wallet
      removeWalletAsset(walletId, tokenId)
      // If this was the last token for this wallet, could navigate back
      const walletAssets = getWalletAssets(walletId)
      if (walletAssets.size === 0) {
        // Wallet has no assets left
      }
    } else {
      // Single wallet: use transfer state
      // use case: redirect to add token screen if there is no token left
      if (selectedTokensCounter === 1) {
        clearSearch()
        navigateTo.addToken({shouldPopPrevious: true})
      }
      // Note: amountRemoved is from useTransfer, but for single wallet we might still need it
      // For now, we'll handle single wallet differently
      if (!isMultipleWallets) {
        // This will be handled by the transfer package
        // We need to check if useTransfer still works for single wallet
      }
    }
  }

  const handleOnSuccess = React.useCallback(
    async (_signedTx?: CSL.Transaction) => {
      reset()
    },
    [reset],
  )

  const handleOnAdd = (walletId?: string) => {
    clearSearch()
    if (isMultipleWallets && walletId) {
      // Set the wallet for adding assets
      setSelectedWalletForAssets(walletId)
    }
    navigateTo.addToken()
  }

  // Get wallet metas for selected wallets
  const selectedWalletMetas = React.useMemo(() => {
    if (!walletManager) return []
    return selectedInputWalletIds
      .map((id) => walletManager.getWalletMetaById(id))
      .filter((meta): meta is NonNullable<typeof meta> => meta !== null)
  }, [walletManager, selectedInputWalletIds])

  // Sort wallets: current wallet first, then others
  const sortedWalletMetas = React.useMemo(() => {
    const currentWalletMeta = selectedWalletMetas.find(
      (meta) => meta.id === wallet.id,
    )
    const otherWalletMetas = selectedWalletMetas.filter(
      (meta) => meta.id !== wallet.id,
    )
    return currentWalletMeta
      ? [currentWalletMeta, ...otherWalletMetas]
      : selectedWalletMetas
  }, [selectedWalletMetas, wallet.id])

  const handleToggleWallet = (walletId: string) => {
    setExpandedWallets((prev) => {
      const updated = new Map(prev)
      updated.set(walletId, !(updated.get(walletId) ?? false))
      return updated
    })
  }

  const createUnsignedTxPromise = React.useCallback(
    async (entries: TransactionOutput[]) => {
      try {
        const isMultiparty = selectedInputWalletIds.length > 1

        logger.info('ListAmountsToSendScreen: Creating transaction', {
          isMultiparty,
          inputWalletCount: selectedInputWalletIds.length,
          subtractFeeFromAmount: isSendingMaxAda,
          entriesCount: entries.length,
          addressMode,
          firstEntryAdaAmount:
            entries[0]?.amounts[wallet.portfolioPrimaryTokenInfo.id] ??
            Branded.ZERO_QUANTITY,
        })

        if (isMultiparty) {
          // Build multiparty transaction
          if (!walletManager) {
            throw new Error('WalletManager not available')
          }

          const result = await createMultipartySendTxFromWallets({
            walletManager,
            inputWalletIds: selectedInputWalletIds,
            entries,
            addressMode,
            subtractFeeFromAmount: isSendingMaxAda,
          })

          // Return with multiparty metadata
          return {
            cbor: result.cbor,
            multiparty: {
              requiredSigners: result.requiredSigners,
            },
          }
        } else {
          // Single wallet - use standard transaction builder
          const result = await createSendTxFromWallet(wallet, {
            entries,
            addressMode,
            // Subtract fee from amount when sending MAX ADA
            subtractFeeFromAmount: isSendingMaxAda,
          })
          return result
        }
      } catch (error) {
        logger.error('Send: createTransaction failed', {
          error: error instanceof Error ? error.message : String(error),
          entriesCount: entries.length,
          addressMode,
          subtractFeeFromAmount: isSendingMaxAda,
          isMultiparty: selectedInputWalletIds.length > 1,
        })
        throw error
      }
    },
    [
      wallet,
      walletManager,
      addressMode,
      isSendingMaxAda,
      selectedInputWalletIds,
    ],
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
          // signedTx can be Transaction or a function, but handleOnSuccess expects Transaction | undefined
          // Since handleOnSuccess doesn't use the parameter, pass undefined
          handleOnSuccess(undefined)
        },
        context: 'send',
      })
    },
    [navigateToTxReview, handleOnSuccess, selectedInputWalletIds],
  )

  const handleCreateUnsignedTxError = React.useCallback(
    (error: Error) => {
      // Check for insufficient balance errors and show error screen
      if (
        error instanceof NotEnoughMoneyToSendError ||
        isInsufficientBalanceError(error)
      ) {
        logger.info('ListAmountsToSendScreen: Insufficient balance error', {
          errorMessage: error.message,
        })
        // Use unified result screen with insufficient balance message
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
      // Re-throw other errors to be handled by default error handling
      throw error
    },
    [resultNavigation, strings, resetToStartTransfer],
  )

  const {resolve: createUnsignedTx, isPending} = usePromise({
    promise: createUnsignedTxPromise,
    onSuccess: handleCreateUnsignedTxSuccess,
    onError: handleCreateUnsignedTxError,
  })

  const handleOnNext = () => {
    if (!selectedTarget) return

    // Check if we need to navigate to allocation screen
    // (multiple destinations require allocation)
    if (targets.length > 1) {
      navigateTo.allocateAssets()
      return
    }

    // Build transaction entries
    let entries: TransactionOutput[]

    if (isMultipleWallets) {
      // Multiple wallets: aggregate assets from all wallets into entries
      // For now, we'll aggregate all assets into a single entry per target
      // TODO: When allocation screen is implemented, assets will be allocated per destination
      entries = targets.map((target) => {
        // Validate address - only use resolved address, never unresolved domains
        const isDomain = target.receiver.as === 'domain'
        const resolvedAddress =
          target.entry.address && target.entry.address.trim() !== ''
            ? target.entry.address
            : null

        // For domains, we MUST have a resolved address
        if (isDomain && !resolvedAddress) {
          throw new Error(
            `Domain "${target.receiver.resolve}" failed to resolve for target at index ${targets.indexOf(target)}`,
          )
        }

        // For direct addresses, use entry.address if available, otherwise use receiver.resolve
        const address =
          resolvedAddress ??
          (target.receiver.resolve && !isDomain
            ? target.receiver.resolve
            : null)

        if (!address || address.trim() === '') {
          throw new Error(
            `Invalid address for target at index ${targets.indexOf(target)}`,
          )
        }

        // Aggregate assets from all wallets for this target
        const aggregatedAmounts: Record<
          Portfolio.Token.Id,
          Portfolio.Token.Amount
        > = {}

        selectedInputWalletIds.forEach((walletId) => {
          const walletAssets = getWalletAssets(walletId)
          walletAssets.forEach((amount, tokenId) => {
            if (aggregatedAmounts[tokenId]) {
              // Sum quantities for same token across wallets
              aggregatedAmounts[tokenId] = {
                ...aggregatedAmounts[tokenId],
                quantity: aggregatedAmounts[tokenId].quantity + amount.quantity,
              }
            } else {
              aggregatedAmounts[tokenId] = amount
            }
          })
        })

        // Create entry with aggregated amounts
        return toTransactionOutput({
          address: address as Address,
          amounts: aggregatedAmounts,
          datum: target.entry.datum,
        })
      })
    } else {
      // Single wallet: use transfer state
      // Validate address
      const address =
        selectedTarget.entry.address &&
        selectedTarget.entry.address.trim() !== ''
          ? selectedTarget.entry.address
          : selectedTarget.receiver.resolve

      if (!address || address.trim() === '') {
        throw new Error('Invalid address for transaction')
      }

      entries = [
        toTransactionOutput({
          ...selectedTarget.entry,
          address: address as Address,
        }),
      ]
    }

    createUnsignedTx(entries)
  }

  return (
    <SafeArea>
      {isMultipleWallets ? (
        // Show accordion with wallets when multiple inputs selected
        <AmountsList
          data={sortedWalletMetas}
          renderItem={({item: walletMeta}) => {
            const isExpanded =
              expandedWallets.get(walletMeta.id) ?? walletMeta.id === wallet.id
            // Get assets for this specific wallet
            const walletAssetsMap = getWalletAssets(walletMeta.id)
            const walletAmounts = Array.from(walletAssetsMap.values())

            return (
              <Boundary>
                <Accordion
                  label={walletMeta.name}
                  expanded={isExpanded}
                  onChange={() => handleToggleWallet(walletMeta.id)}
                >
                  <Space.Height.lg />
                  {isExpanded && (
                    <>
                      {/* Show assets for this wallet */}
                      {walletAmounts.length > 0 ? (
                        <View style={[a.px_lg]}>
                          {walletAmounts.map((amount) => (
                            <ActionableAmount
                              key={amount.info.id}
                              amount={amount}
                              onRemove={() =>
                                handleOnRemove(amount.info.id, walletMeta.id)
                              }
                              onEdit={() =>
                                handleOnEdit(amount.info.id, walletMeta.id)
                              }
                            />
                          ))}
                        </View>
                      ) : (
                        <View style={[a.px_lg, a.py_lg]}>
                          <Text
                            style={[a.body_2_md_regular, {color: p.gray_600}]}
                          >
                            {strings.send.noAssetsAddedYet(
                              strings.send.assets(0),
                            )}
                          </Text>
                        </View>
                      )}

                      {/* Add assets button for this wallet */}
                      <View style={[a.px_lg, a.pb_lg]}>
                        <AddTokenButton
                          onPress={() => handleOnAdd(walletMeta.id)}
                        />
                      </View>
                    </>
                  )}
                </Accordion>
                <Space.Height.md />
              </Boundary>
            )
          }}
          bounces={false}
          keyExtractor={(item) => item.id}
          testID="walletAccordions"
          contentContainerStyle={[a.px_lg, a.pt_lg]}
        />
      ) : (
        // Single wallet - show current behavior
        <AmountsList
          data={Object.values(amounts)}
          renderItem={({item: amount}) => (
            <Boundary>
              <ActionableAmount
                amount={amount}
                onRemove={handleOnRemove}
                onEdit={handleOnEdit}
              />
            </Boundary>
          )}
          bounces={false}
          keyExtractor={(item) => item.info.id}
          testID="selectedTokens"
          contentContainerStyle={[a.px_lg]}
          style={[a.pt_lg]}
        />
      )}

      <SafeArea.Footer style={[a.bg_transparent, a.gap_lg]}>
        {!isMultipleWallets && <AddTokenButton onPress={handleOnAdd} />}

        <NextButton
          onPress={handleOnNext}
          title={strings.send.next}
          disabled={selectedTokensCounter === 0}
          isLoading={isPending}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

type ActionableAmountProps = {
  amount: Portfolio.Token.Amount
  onEdit(tokenId: Portfolio.Token.Id): void
  onRemove(tokenId: Portfolio.Token.Id): void
}
const ActionableAmount = ({
  amount,
  onRemove,
  onEdit,
}: ActionableAmountProps) => {
  const handleRemove = () => onRemove(amount.info.id)
  const handleEdit = () => (isNft(amount.info) ? null : onEdit(amount.info.id))

  return (
    <View
      style={[a.flex_row, a.justify_between, a.align_center]}
      testID="amountItem"
    >
      <Left style={a.flex_1}>
        <EditAmountButton onPress={handleEdit}>
          <TokenAmountItem amount={amount} ignorePrivacy />
        </EditAmountButton>
      </Left>

      <Right style={a.pl_lg}>
        <RemoveAmountButton onPress={handleRemove} />
      </Right>
    </View>
  )
}

type EditAmountButtonProps = React.PropsWithChildren<{
  onPress(): void
}>
const EditAmountButton = ({onPress, children}: EditAmountButtonProps) => {
  return (
    <TouchableOpacity
      style={a.py_lg}
      onPress={onPress}
      testID="editAmountButton"
    >
      {children}
    </TouchableOpacity>
  )
}

const Left = View
const Right = View
const NextButton = Button
const AmountsList = FlatList
