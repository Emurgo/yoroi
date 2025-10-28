import {isNft} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useSearch} from '~/features/Search/SearchContext'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {toYoroiEntry} from '~/features/Send/common/toYoroiEntry'
import {useSaveMemo} from '~/features/Transactions/hooks/useSaveMemo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {AddTokenButton} from '~/ui/AddTokenButton/AddTokenButton'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {RemoveAmountButton} from '~/ui/RemoveAmountButton/RemoveAmountButton'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'
import {YoroiEntry, YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

export const ListAmountsToSendScreen = () => {
  const navigateTo = useNavigateTo()
  const {navigateToTxReview} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {wallet} = useSelectedWallet()
  const {unsignedTxChanged} = useReviewTx()
  const {
    memo,
    targets,
    selectedTargetIndex,
    tokenSelectedChanged,
    amountRemoved,
    reset,
  } = useTransfer()
  const {saveMemo} = useSaveMemo({wallet})

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

  React.useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => <ListAmountsNavigateBackButton />})
  }, [navigation])

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
    (signedTx?: YoroiSignedTx) => {
      if (signedTx?.signedTx?.id == null)
        throw new Error('ListAmountsToSendScreen:: invalid state')

      if (memo.length > 0) {
        saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
      }

      reset()
    },
    [memo, saveMemo, reset],
  )

  const handleOnAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  const createUnsignedTxPromise = React.useCallback(
    (entries: YoroiEntry[]) => wallet.createUnsignedTx({entries, addressMode}),
    [wallet, addressMode],
  )

  const handleCreateUnsignedTxSuccess = React.useCallback(
    (yoroiUnsignedTx: YoroiUnsignedTx) => {
      unsignedTxChanged(yoroiUnsignedTx)
      navigateToTxReview({
        onSuccess: (args) => handleOnSuccess(args?.signedTx),
      })
    },
    [unsignedTxChanged, navigateToTxReview, handleOnSuccess],
  )

  const {resolve: createUnsignedTx, isPending} = usePromise({
    promise: createUnsignedTxPromise,
    onSuccess: handleCreateUnsignedTxSuccess,
  })

  const handleOnNext = () => {
    if (!selectedTarget) return
    createUnsignedTx([toYoroiEntry(selectedTarget.entry)])
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

const ListAmountsNavigateBackButton = () => {
  const navigateTo = useNavigateTo()
  const {atoms: ta} = useTheme()

  return (
    <TouchableOpacity
      onPress={() => {
        // Use the startTxAfterReset method which properly resets the stack
        navigateTo.startTxAfterReset()
      }}
    >
      <Icon.Chevron direction="left" color={ta.el_gray_max.color} />
    </TouchableOpacity>
  )
}

const Left = View
const Right = View
const NextButton = Button
const AmountsList = FlatList
