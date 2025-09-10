import {isNft} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useSearch} from '~/features/Search/SearchContext'
import {useNavigateTo} from '~/features/Send/common/navigation'
import {toYoroiEntry} from '~/features/Send/common/toYoroiEntry'
import {useSaveMemo} from '~/features/Transactions/hooks/useSaveMemo'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {assetsToSendProperties} from '~/kernel/metrics/helpers'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {AddTokenButton} from '~/ui/AddTokenButton/AddTokenButton'
import {Boundary} from '~/ui/Boundary/Boundary'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {RemoveAmountButton} from '~/ui/RemoveAmountButton/RemoveAmountButton'
import {Space} from '~/ui/Space/Space'
import {TokenAmountItem} from '~/ui/TokenAmountItem/TokenAmountItem'
import {YoroiEntry, YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

export const ListAmountsToSendScreen = () => {
  const navigateTo = useNavigateTo()
  const {navigateToTxReview} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const {unsignedTxChanged} = useReviewTx()
  const {atoms: ta} = useTheme()
  const {
    memo,
    targets,
    selectedTargetIndex,
    tokenSelectedChanged,
    amountRemoved,
    reset,
  } = useTransfer()
  const {saveMemo} = useSaveMemo({wallet})

  const {amounts} = targets[selectedTargetIndex].entry
  const selectedTokensCounter = Object.keys(amounts).length
  const {
    meta: {addressMode},
  } = useSelectedWallet()

  const sendProperties = React.useMemo(
    () => assetsToSendProperties({amounts}),
    [amounts],
  )

  React.useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => <ListAmountsNavigateBackButton />})
  }, [navigation])

  React.useEffect(() => {
    track.sendSelectAssetUpdated(assetsToSendProperties({amounts}))
  }, [amounts, selectedTokensCounter, track])

  const handleOnEdit = (tokenId: Portfolio.Token.Id) => {
    if (isNft(amounts[tokenId].info)) return

    const amount = amounts[tokenId]
    if (!amount) return

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
      track.sendSummarySubmitted(sendProperties)

      if (memo.length > 0) {
        saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
      }

      reset()
      navigateTo.submittedTx()
    },
    [track, sendProperties, memo, saveMemo, reset, navigateTo],
  )

  const handleOnError = React.useCallback(() => {
    track.sendSummarySubmitted(sendProperties)
    navigateTo.failedTx()
  }, [track, sendProperties, navigateTo])

  const createUnsignedTxPromise = React.useCallback(
    (entries: YoroiEntry[]) => wallet.createUnsignedTx({entries, addressMode}),
    [wallet, addressMode],
  )

  const handleCreateUnsignedTxSuccess = React.useCallback(
    (yoroiUnsignedTx: YoroiUnsignedTx) => {
      unsignedTxChanged(yoroiUnsignedTx)
      navigateToTxReview({
        onSuccess: (args) => handleOnSuccess(args?.signedTx),
        onError: handleOnError,
      })
    },
    [unsignedTxChanged, navigateToTxReview, handleOnSuccess, handleOnError],
  )

  const handleOnNext = () => {
    track.sendSelectAssetSelected(assetsToSendProperties({amounts}))
    createUnsignedTx([toYoroiEntry(targets[selectedTargetIndex].entry)])
  }

  const handleOnAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  const {resolve: createUnsignedTx, isPending} = usePromise({
    promise: createUnsignedTxPromise,
    onSuccess: handleCreateUnsignedTxSuccess,
    onError: handleOnError,
  })

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg, a.pb_lg, a.gap_xl, ta.bg_color_max]}
    >
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
      />

      <Actions style={[a.bg_transparent]}>
        <Row>
          <Space.Height._2xs fill />

          <AddTokenButton onPress={handleOnAdd} />
        </Row>

        <Space.Height.xl />

        <NextButton
          onPress={handleOnNext}
          title={strings.send.next}
          disabled={selectedTokensCounter === 0}
          isLoading={isPending}
        />
      </Actions>
    </SafeAreaView>
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
      style={[a.py_lg]}
      onPress={onPress}
      testID="editAmountButton"
    >
      {children}
    </TouchableOpacity>
  )
}

const ListAmountsNavigateBackButton = () => {
  const navigation = useNavigateTo()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity onPress={() => navigation.startTx()}>
      <Icon.Chevron direction="left" color={p.el_gray_max} />
    </TouchableOpacity>
  )
}

const Left = View
const Right = View
const Actions = View
const Row = View
const NextButton = Button
const AmountsList = FlatList
