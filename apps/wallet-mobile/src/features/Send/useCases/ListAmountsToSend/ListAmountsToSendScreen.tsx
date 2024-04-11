import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import type {Balance} from '@yoroi/types'
import * as React from 'react'
import {useLayoutEffect} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {useMutation} from 'react-query'

import {Boundary, Button, Icon, Spacer} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import globalMessages from '../../../../i18n/global-messages'
import {assetsToSendProperties} from '../../../../metrics/helpers'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useSearch} from '../../../../Search/SearchContext'
import {sortTokenInfos} from '../../../../utils'
import {useTokenInfo, useTokenInfos} from '../../../../yoroi-wallets/hooks'
import {YoroiEntry} from '../../../../yoroi-wallets/types'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../WalletManager/Context'
import {useNavigateTo, useOverridePreviousSendTxRoute} from '../../common/navigation'
import {AddTokenButton} from './AddToken/AddToken'
import {RemoveAmountButton} from './RemoveAmount'

export const ListAmountsToSendScreen = () => {
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const {clearSearch} = useSearch()
  const navigation = useNavigation()
  const {track} = useMetrics()

  useOverridePreviousSendTxRoute('send-start-tx')

  useLayoutEffect(() => {
    navigation.setOptions({headerLeft: () => <ListAmountsNavigateBackButton />})
  }, [navigation])

  const {
    targets,
    selectedTargetIndex,
    tokenSelectedChanged,
    amountRemoved,
    unsignedTxChanged: yoroiUnsignedTxChanged,
  } = useTransfer()
  const {amounts} = targets[selectedTargetIndex].entry

  const selectedTokensCounter = Amounts.toArray(amounts).length

  const wallet = useSelectedWallet()
  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })
  const tokens = sortTokenInfos({wallet, tokenInfos})
  const {mutate: createUnsignedTx, isLoading} = useMutation({
    mutationFn: (entries: YoroiEntry[]) => wallet.createUnsignedTx(entries),
    retry: false,
    useErrorBoundary: true,
  })

  React.useEffect(() => {
    track.sendSelectAssetUpdated(assetsToSendProperties({tokens, amounts}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amounts, tokens.length, track])

  const onEdit = (tokenId: string) => {
    const tokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === tokenId)
    if (tokenInfo?.kind === 'nft') return

    tokenSelectedChanged(tokenId)
    navigateTo.editAmount()
  }
  const onRemove = (tokenId: string) => {
    // use case: redirect to add token screen if there is no token left
    if (selectedTokensCounter === 1) {
      clearSearch()
      navigateTo.addToken()
    }
    amountRemoved(tokenId)
  }
  const onNext = () => {
    track.sendSelectAssetSelected(assetsToSendProperties({tokens, amounts}))
    createUnsignedTx([targets[selectedTargetIndex].entry], {
      onSuccess: (yoroiUnsignedTx) => {
        yoroiUnsignedTxChanged(yoroiUnsignedTx)
        navigateTo.confirmTx()
      },
    })
  }
  const onAdd = () => {
    clearSearch()
    navigateTo.addToken()
  }

  return (
    <View style={styles.container}>
      <AmountsList
        data={tokens}
        renderItem={({item: {id}}: {item: Balance.TokenInfo}) => (
          <Boundary>
            <ActionableAmount amount={Amounts.getAmount(amounts, id)} onRemove={onRemove} onEdit={onEdit} />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({id}) => id}
        testID="selectedTokens"
      />

      <Actions>
        <Row>
          <Spacer fill />

          <AddTokenButton onPress={onAdd} />
        </Row>

        <Spacer height={33} />

        <NextButton
          onPress={onNext}
          title={strings.next}
          shelleyTheme
          disabled={selectedTokensCounter === 0 || isLoading}
        />
      </Actions>
    </View>
  )
}

type ActionableAmountProps = {
  amount: Balance.Amount
  onEdit(tokenId: string): void
  onRemove(tokenId: string): void
}
const ActionableAmount = ({amount, onRemove, onEdit}: ActionableAmountProps) => {
  const wallet = useSelectedWallet()
  const {styles} = useStyles()
  const {tokenId} = amount
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const handleRemove = () => onRemove(tokenId)
  const handleEdit = () => (tokenInfo.kind === 'nft' ? null : onEdit(tokenId))

  return (
    <View style={styles.amountItem} testID="amountItem">
      <Left>
        <EditAmountButton onPress={handleEdit}>
          <AmountItem amount={amount} wallet={wallet} />
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
  return <View style={[style, styles.transparent]} {...props} />
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

export const useStrings = () => {
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
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
    },
    transparent: {
      backgroundColor: 'transparent',
      ...padding['y-l'],
    },
    container: {
      flex: 1,
      backgroundColor: color.gray.min,
      ...padding['x-l'],
    },
    amountItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
  const colors = {
    black: color['black-static'],
  }
  return {styles, colors}
}

const NextButton = Button
const AmountsList = FlatList

const ListAmountsNavigateBackButton = () => {
  const navigation = useNavigateTo()
  const {colors} = useStyles()

  return (
    <TouchableOpacity onPress={() => navigation.startTx()}>
      <Icon.Chevron direction="left" color={colors.black} />
    </TouchableOpacity>
  )
}
