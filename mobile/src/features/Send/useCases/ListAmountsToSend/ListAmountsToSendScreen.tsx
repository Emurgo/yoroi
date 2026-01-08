import {createSendTxFromWallet} from '@yoroi/cardano-wallet'
import {isNft, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {NotEnoughMoneyToSendError, TransactionOutput} from '@yoroi/tx'
import {Branded, Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as CSL from '@emurgo/cross-csl-core'
import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {usePromise} from '~/common/hooks/usePromise'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useSearch} from '~/features/Search/SearchContext'
import {useDynamicLockedDeposit} from '~/features/Send/common/hooks/useDynamicLockedDeposit'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {toTransactionOutput} from '~/features/Send/common/toTransactionOutput'
import {isInsufficientBalanceError} from '~/features/Staking/Governance/common/transactionErrorHandling'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {BackButton} from '~/kernel/navigation/common/helpers'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {AddTokenButton} from '~/ui/AddTokenButton/AddTokenButton'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {RemoveAmountButton} from '~/ui/RemoveAmountButton/RemoveAmountButton'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'

export const ListAmountsToSendScreen = () => {
  const navigateTo = useNavigateTo()
  const {navigateToTxReview, resetToStartTransfer} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {wallet} = useSelectedWallet()
  const {
    targets,
    selectedTargetIndex,
    tokenSelectedChanged,
    amountRemoved,
    reset,
    allocated,
  } = useTransfer()

  const selectedTarget = targets[selectedTargetIndex]
  const amounts = React.useMemo(() => {
    const targetAmounts: Record<Portfolio.Token.Id, Portfolio.Token.Amount> =
      selectedTarget?.entry.amounts ?? {}
    if (!selectedTarget) return {}
    return targetAmounts
  }, [selectedTarget])
  const selectedTokensCounter = Object.keys(amounts).length
  const {
    meta: {addressMode},
  } = useSelectedWallet()

  // Check if MAX amount is being sent for primary token
  const balances = usePortfolioBalances({wallet})
  const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
  const primaryAmount = amounts[primaryTokenId]

  // Get tokens being sent (excluding primary token for dynamic calculation)
  const tokensBeingSent = React.useMemo(() => {
    const tokens: Record<Portfolio.Token.Id, Portfolio.Token.Amount> = {}
    for (const [tokenId, amount] of Object.entries(amounts)) {
      if (tokenId !== primaryTokenId && !isPrimaryToken(amount.info)) {
        tokens[tokenId as Portfolio.Token.Id] = amount
      }
    }
    return tokens
  }, [amounts, primaryTokenId])

  // Calculate dynamic locked deposit based on tokens being sent
  const {dynamicLocked, currentLocked} = useDynamicLockedDeposit({
    tokensBeingSent,
  })

  const isSendingMaxAda = React.useMemo(() => {
    if (!primaryAmount || !isPrimaryToken(primaryAmount.info)) return false

    const available =
      (balances.records.get(primaryTokenId)?.quantity ?? BigInt(0)) -
      (allocated.get(selectedTargetIndex)?.get(primaryTokenId) ?? BigInt(0))

    // Use dynamic locked if tokens are being sent, otherwise use current locked
    const lockedToUse =
      Object.keys(tokensBeingSent).length > 0 ? dynamicLocked : currentLocked
    const spendable = available - lockedToUse

    // Check if the amount equals spendable (MAX was used)
    const isMax = primaryAmount.quantity === spendable && spendable > BigInt(0)

    logger.info('ListAmountsToSendScreen: MAX detection', {
      primaryAmount: primaryAmount.quantity.toString(),
      available: available.toString(),
      currentLocked: currentLocked.toString(),
      dynamicLocked: dynamicLocked.toString(),
      lockedToUse: lockedToUse.toString(),
      spendable: spendable.toString(),
      tokensBeingSent: Object.keys(tokensBeingSent),
      isSendingMaxAda: isMax,
    })

    return isMax
  }, [
    primaryAmount,
    balances,
    currentLocked,
    dynamicLocked,
    tokensBeingSent,
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

  const handleOnEdit = (tokenId: Portfolio.Token.Id) => {
    const amount = amounts[tokenId]
    if (!amount) return
    if (isNft(amount.info)) return

    tokenSelectedChanged(tokenId)
    navigateTo.editAmount(amount)
  }
  const handleOnRemove = (tokenId: Portfolio.Token.Id) => {
    // use case: redirect to add token screen if there is no token left
    if (selectedTokensCounter === 1) {
      clearSearch()
      navigateTo.addToken({shouldPopPrevious: true})
    }
    amountRemoved(tokenId)
  }

  const handleOnSuccess = React.useCallback(
    async (_signedTx?: CSL.Transaction) => {
      reset()
    },
    [reset],
  )

  const handleOnAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  const createUnsignedTxPromise = React.useCallback(
    async (entries: TransactionOutput[]) => {
      try {
        logger.info('ListAmountsToSendScreen: Creating transaction', {
          subtractFeeFromAmount: isSendingMaxAda,
          entriesCount: entries.length,
          addressMode,
          firstEntryAdaAmount:
            entries[0]?.amounts[wallet.portfolioPrimaryTokenInfo.id] ??
            Branded.ZERO_QUANTITY,
        })
        const result = await createSendTxFromWallet(wallet, {
          entries,
          addressMode,
          // Subtract fee from amount when sending MAX ADA
          subtractFeeFromAmount: isSendingMaxAda,
        })
        return result
      } catch (error) {
        logger.error('Send: createSendTxFromWallet failed', {
          error: error instanceof Error ? error.message : String(error),
          entriesCount: entries.length,
          addressMode,
          subtractFeeFromAmount: isSendingMaxAda,
        })
        throw error
      }
    },
    [wallet, addressMode, isSendingMaxAda],
  )

  const handleCreateUnsignedTxSuccess = React.useCallback(
    (result: {cbor: string}) => {
      navigateToTxReview({
        cbor: result.cbor,
        onSuccess: () => {
          // signedTx can be Transaction or a function, but handleOnSuccess expects Transaction | undefined
          // Since handleOnSuccess doesn't use the parameter, pass undefined
          handleOnSuccess(undefined)
        },
        context: 'send',
      })
    },
    [navigateToTxReview, handleOnSuccess],
  )

  const handleCreateUnsignedTxError = React.useCallback(
    (error: Error) => {
      logger.error('ListAmountsToSendScreen: Transaction creation failed', {
        errorMessage: error.message,
        errorStack: error.stack,
      })

      if (
        error instanceof NotEnoughMoneyToSendError ||
        isInsufficientBalanceError(error)
      ) {
        // Use unified result screen with insufficient balance message
        // @ts-ignore - Navigating to a screen in a sibling navigator
        navigation.navigate('manage-wallets', {
          screen: 'review-tx-routes',
          params: {
            screen: 'result-screen',
            params: {
              type: 'error',
              context: 'send',
              title: strings.send.noBalance,
              message: strings.send.failedTxText,
              primaryAction: {
                title: strings.send.failedTxButton,
                onPress: resetToStartTransfer,
              },
            },
          },
        })
        return
      }

      // Show generic error screen for other unexpected errors
      // @ts-ignore - Navigating to a screen in a sibling navigator
      navigation.navigate('manage-wallets', {
        screen: 'review-tx-routes',
        params: {
          screen: 'result-screen',
          params: {
            type: 'error',
            context: 'send',
            title: strings.send.failedTxTitle,
            message: error.message,
            primaryAction: {
              title: strings.send.failedTxButton,
              onPress: resetToStartTransfer,
            },
          },
        },
      })
    },
    [navigation, strings, resetToStartTransfer],
  )

  const {resolve: createUnsignedTx, isPending} = usePromise({
    promise: createUnsignedTxPromise,
    onSuccess: handleCreateUnsignedTxSuccess,
    onError: handleCreateUnsignedTxError,
  })

  const handleOnNext = () => {
    if (!selectedTarget) return

    const transactionOutput = toTransactionOutput(selectedTarget.entry)
    createUnsignedTx([transactionOutput])
  }
  return (
    <SafeArea>
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

      <SafeArea.Footer style={[a.bg_transparent, a.gap_lg]}>
        <AddTokenButton onPress={handleOnAdd} />

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
