import {useNavigation} from '@react-navigation/native'
import {isNft} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {useLayoutEffect} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useMutation} from 'react-query'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Button} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {Spacer} from '../../../../components/Spacer/Spacer'
import globalMessages from '../../../../kernel/i18n/global-messages'
import {assetsToSendProperties} from '../../../../kernel/metrics/helpers'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useSaveMemo} from '../../../../yoroi-wallets/hooks'
import {YoroiEntry, YoroiSignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {TokenAmountItem} from '../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {useSearch} from '../../../Search/SearchContext'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../common/navigation'
import {toYoroiEntry} from '../../common/toYoroiEntry'
import {AddTokenButton} from './AddToken/AddToken'
import {RemoveAmountButton} from './RemoveAmount'

export const ListAmountsToSendScreen = () => {
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {navigateToTxReview} = useWalletNavigation()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const {unsignedTxChanged, onSuccessChanged, onErrorChanged} = useReviewTx()

  useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => <ListAmountsNavigateBackButton />})
  }, [navigation])

  const {memo, targets, selectedTargetIndex, tokenSelectedChanged, amountRemoved} = useTransfer()
  const {saveMemo} = useSaveMemo({wallet})
  const {amounts} = targets[selectedTargetIndex].entry
  const selectedTokensCounter = Object.keys(amounts).length

  const {
    meta: {addressMode},
  } = useSelectedWallet()
  const {mutate: createUnsignedTx, isLoading} = useMutation({
    mutationFn: (entries: YoroiEntry[]) => wallet.createUnsignedTx({entries, addressMode}),
    retry: false,
    useErrorBoundary: true,
  })

  React.useEffect(() => {
    track.sendSelectAssetUpdated(assetsToSendProperties({amounts}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const sendProperties = React.useMemo(() => assetsToSendProperties({amounts}), [amounts])

  const onSuccess = (signedTx: YoroiSignedTx) => {
    track.sendSummarySubmitted(sendProperties)
    navigateTo.submittedTx(signedTx.signedTx.id)

    if (memo.length > 0) {
      saveMemo({txId: signedTx.signedTx.id, memo: memo.trim()})
    }
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
        onSuccessChanged(onSuccess)
        onErrorChanged(onError)
        navigateToTxReview()
      },
    })
  }
  const onAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <AmountsList
        data={Object.values(amounts)}
        renderItem={({item: amount}) => (
          <Boundary>
            <ActionableAmount amount={amount} onRemove={onRemove} onEdit={onEdit} />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({info}) => info.id}
        testID="selectedTokens"
      />

      <Actions>
        <Row>
          <Spacer fill />

          <AddTokenButton onPress={onAdd} />
        </Row>

        <Spacer height={33} />

        <NextButton onPress={onNext} title={strings.next} disabled={selectedTokensCounter === 0 || isLoading} />
      </Actions>
    </SafeAreaView>
  )
}

type ActionableAmountProps = {
  amount: Portfolio.Token.Amount
  onEdit(tokenId: Portfolio.Token.Id): void
  onRemove(tokenId: Portfolio.Token.Id): void
}
const ActionableAmount = ({amount, onRemove, onEdit}: ActionableAmountProps) => {
  const {styles} = useStyles()

  const handleRemove = () => onRemove(amount.info.id)
  const handleEdit = () => (isNft(amount.info) ? null : onEdit(amount.info.id))

  return (
    <View style={styles.amountItem} testID="amountItem">
      <Left>
        <EditAmountButton onPress={handleEdit}>
          <TokenAmountItem amount={amount} ignorePrivacy />
        </EditAmountButton>
      </Left>

      <Right>
        <RemoveAmountButton onPress={handleRemove} />
      </Right>
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={[style, {flex: 1}]} {...props} />
const Right = ({style, ...props}: ViewProps) => <View style={[style, {paddingLeft: 16}]} {...props} />
const Actions = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[style, styles.actions]} {...props} />
}
const Row = ({style, ...props}: ViewProps) => {
  const {styles} = useStyles()
  return <View style={[style, styles.row]} {...props} />
}

// use case: edit amount
type EditAmountButtonProps = {
  onPress(): void
  children?: React.ReactNode
}
const EditAmountButton = ({onPress, children}: EditAmountButtonProps) => {
  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onPress} testID="editAmountButton">
      {children}
    </TouchableOpacity>
  )
}

const NextButton = Button
const AmountsList = FlatList

const ListAmountsNavigateBackButton = () => {
  const navigation = useNavigateTo()
  const {colors} = useStyles()

  return (
    <TouchableOpacity onPress={() => navigation.startTx()}>
      <Icon.Chevron direction="left" color={colors.icon} />
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    row: {
      ...atoms.flex_row,
    },
    actions: {
      backgroundColor: 'transparent',
    },
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
      ...atoms.gap_xl,
    },
    amountItem: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
  })
  const colors = {
    icon: color.el_gray_max,
  }
  return {styles, colors} as const
}
