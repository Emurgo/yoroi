import {useNavigation} from '@react-navigation/native'
import {useMutation} from '@tanstack/react-query'
import {isNft} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {useLayoutEffect} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import globalMessages from '../../../../kernel/i18n/global-messages'
import {assetsToSendProperties} from '../../../../kernel/metrics/helpers'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useSaveMemo} from '../../../../wallets/hooks'
import {YoroiEntry, YoroiSignedTx} from '../../../../wallets/types/yoroi'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {useSearch} from '../../../Search/SearchContext'
import {AddTokenButton} from '../../../ui/AddTokenButton/AddTokenButton'
import {Boundary} from '../../../ui/Boundary/Boundary'
import {Button} from '../../../ui/Button/Button'
import {Icon} from '../../../ui/Icon'
import {RemoveAmountButton} from '../../../ui/RemoveAmountButton/RemoveAmountButton'
import {Spacer} from '../../../ui/Space/Space'
import {TokenAmountItem} from '../../../ui/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../common/navigation'
import {toYoroiEntry} from '../../common/toYoroiEntry'

export const ListAmountsToSendScreen = () => {
  const navigateTo = useNavigateTo()
  const {navigateToTxReview} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const {unsignedTxChanged} = useReviewTx()
  const {color} = useTheme()

  useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => <ListAmountsNavigateBackButton />})
  }, [navigation])

  const {
    memo,
    targets,
    selectedTargetIndex,
    tokenSelectedChanged,
    amountRemoved,
  } = useTransfer()
  const {saveMemo} = useSaveMemo({wallet})
  const {amounts} = targets[selectedTargetIndex].entry
  const selectedTokensCounter = Object.keys(amounts).length

  const {
    meta: {addressMode},
  } = useSelectedWallet()
  const {mutate: createUnsignedTx, isLoading} = useMutation({
    mutationFn: (entries: YoroiEntry[]) =>
      wallet.createUnsignedTx({entries, addressMode}),
    retry: false,
    useErrorBoundary: true,
  })

  React.useEffect(() => {
    track.sendSelectAssetUpdated(assetsToSendProperties({amounts}))
  }, [amounts, selectedTokensCounter, track])

  const onEdit = (tokenId: Portfolio.Token.Id) => {
    if (isNft(amounts[tokenId].info)) return

    tokenSelectedChanged(tokenId)
    navigateTo.editAmount()
  }
  const onRemove = (tokenId: Portfolio.Token.Id) => {
    // use case: redirect to add token screen if there is no token left
    if (selectedTokensCounter === 1) {
      clearSearch()
      navigateTo.addToken({shouldPopPrevious: true})
    }
    amountRemoved(tokenId)
  }

  const sendProperties = React.useMemo(
    () => assetsToSendProperties({amounts}),
    [amounts],
  )

  const handleOnSuccess = (signedTx?: YoroiSignedTx) => {
    if (signedTx?.signedTx?.id == null)
      throw new Error('ListAmountsToSendScreen:: invalid state')
    track.sendSummarySubmitted(sendProperties)

    if (memo.length > 0) {
      saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
    }

    navigateTo.submittedTx()
  }

  const onError = () => {
    track.sendSummarySubmitted(sendProperties)
    navigateTo.failedTx()
  }

  const onNext = () => {
    track.sendSelectAssetSelected(assetsToSendProperties({amounts}))
    // since the user can't see many targets we just send the first one
    // NOTE: update on multi target support
    createUnsignedTx([toYoroiEntry(targets[selectedTargetIndex].entry)], {
      onSuccess: (yoroiUnsignedTx) => {
        unsignedTxChanged(yoroiUnsignedTx)
        navigateToTxReview({
          onSuccess: (args) => handleOnSuccess(args?.signedTx),
          onError,
        })
      },
    })
  }
  const onAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.root, {backgroundColor: color.bg_color_max}]}
    >
      <AmountsList
        data={Object.values(amounts)}
        renderItem={({item: amount}) => (
          <Boundary>
            <ActionableAmount
              amount={amount}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({info}) => info.id}
        testID="selectedTokens"
      />

      <Actions style={[styles.actions, {backgroundColor: 'transparent'}]}>
        <Row style={styles.row}>
          <Spacer fill />

          <AddTokenButton onPress={onAdd} />
        </Row>

        <Spacer height={33} />

        <NextButton
          onPress={onNext}
          title={strings.next}
          disabled={selectedTokensCounter === 0}
          isLoading={isLoading}
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
  const {color} = useTheme()

  const handleRemove = () => onRemove(amount.info.id)
  const handleEdit = () => (isNft(amount.info) ? null : onEdit(amount.info.id))

  return (
    <View
      style={[styles.amountItem, a.flex_row, a.justify_between, a.align_center]}
      testID="amountItem"
    >
      <Left style={[styles.flex, {flex: 1}]}>
        <EditAmountButton onPress={handleEdit}>
          <TokenAmountItem amount={amount} ignorePrivacy />
        </EditAmountButton>
      </Left>

      <Right style={[styles.flex, {paddingLeft: 16}]}>
        <RemoveAmountButton onPress={handleRemove} />
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Right = ({style, ...props}: ViewProps) => (
  <View style={style} {...props} />
)
const Actions = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}
const Row = ({style, ...props}: ViewProps) => {
  return <View style={style} {...props} />
}

// use case: edit amount
type EditAmountButtonProps = {
  onPress(): void
  children?: React.ReactNode
}
const EditAmountButton = ({onPress, children}: EditAmountButtonProps) => {
  return (
    <TouchableOpacity
      style={{paddingVertical: 16}}
      onPress={onPress}
      testID="editAmountButton"
    >
      {children}
    </TouchableOpacity>
  )
}

const NextButton = Button
const AmountsList = FlatList

const ListAmountsNavigateBackButton = () => {
  const navigation = useNavigateTo()
  const {color} = useTheme()

  return (
    <TouchableOpacity onPress={() => navigation.startTx()}>
      <Icon.Chevron direction="left" color={color.el_gray_max} />
    </TouchableOpacity>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    addToken: intl.formatMessage(messages.addToken),
    next: intl.formatMessage(globalMessages.next),
  }
}

const messages = defineMessages({
  addToken: {
    id: 'components.send.addToken',
    defaultMessage: '!!!Add token',
  },
})

const styles = StyleSheet.create({
  row: {},
  actions: {},
  root: {
    ...a.flex_1,
    ...a.px_lg,
    ...a.pb_lg,
    ...a.gap_xl,
  },
  amountItem: {},
})
