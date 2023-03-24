import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {useQuery, UseQueryOptions} from 'react-query'

import {Boundary, Button, Spacer} from '../../../../components'
import {AssetItem} from '../../../../components/AssetItem'
import globalMessages from '../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../navigation'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {sortTokenInfos} from '../../../../utils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo, useTokenInfos} from '../../../../yoroi-wallets/hooks'
import {TokenId, TokenInfo, YoroiAmount, YoroiEntry, YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {Amounts} from '../../../../yoroi-wallets/utils'
import {useSend} from '../../common/SendContext'
import {AddTokenButton} from './AddToken/AddToken'
import {DeleteToken} from './DeleteToken'
import {useOpenTokenListWhenEmpty} from './OpenTokenListWhenEmpty'

export const ListSelectedTokensScreen = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()

  const {targets, selectedTargetIndex, tokenSelectedChanged, amountRemoved, yoroiUnsignedTxChanged} = useSend()
  const {amounts} = targets[selectedTargetIndex].entry

  const selectedTokensCounter = Object.keys(amounts).length
  useOpenTokenListWhenEmpty()

  const wallet = useSelectedWallet()
  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })
  const tokens = sortTokenInfos({wallet, tokenInfos})
  const {refetch} = useSendTx(
    {wallet, entry: targets[selectedTargetIndex].entry},
    {
      onSuccess: (yoroiUnsignedTx) => {
        yoroiUnsignedTxChanged(yoroiUnsignedTx)
        navigateTo.confirmTx()
      },
    },
  )

  const onSelect = (tokenId: TokenId) => {
    tokenSelectedChanged(tokenId)
    navigateTo.editToken()
  }
  const onDelete = (tokenId: TokenId) => amountRemoved(tokenId)
  const onAdd = navigateTo.addToken
  const onNext = () => refetch()

  return (
    <View style={styles.container}>
      <SelectedTokenList
        data={tokens}
        renderItem={({item: {id}}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableToken amount={{tokenId: id, quantity: amounts[id]}} onDelete={onDelete} onSelect={onSelect} />
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

        <NextButton onPress={onNext} title={strings.next} shelleyTheme disabled={selectedTokensCounter === 0} />
      </Actions>
    </View>
  )
}

type SelectableTokenProps = {
  amount: YoroiAmount
  onSelect(tokenId: TokenId): void
  onDelete(tokenId: TokenId): void
}
const SelectableToken = ({amount: {quantity, tokenId}, onDelete, onSelect}: SelectableTokenProps) => {
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId})

  const handleDelete = () => onDelete(tokenId)
  const handleSelect = () => onSelect(tokenId)

  return (
    <DeleteToken onDelete={handleDelete} tokenInfo={tokenInfo}>
      <TouchableOpacity style={{paddingVertical: 16}} onPress={handleSelect} testID="selectToken">
        <AssetItem tokenInfo={tokenInfo} quantity={quantity} />
      </TouchableOpacity>
    </DeleteToken>
  )
}

export const useSendTx = (
  {wallet, entry}: {wallet: YoroiWallet; entry: YoroiEntry},
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'send-tx']>,
) => {
  const query = useQuery({
    ...options,
    cacheTime: 0,
    suspense: true,
    enabled: false,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryKey: [wallet.id, 'send-tx'],
    queryFn: () => wallet.createUnsignedTx(entry),
  })

  return {
    ...query,
    unsignedTx: query.data,
  }
}

const Actions = ({style, ...props}: ViewProps) => <View style={[style, styles.transparent]} {...props} />
const Row = ({style, ...props}: ViewProps) => <View style={[style, styles.row]} {...props} />

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

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    addToken: () => navigation.navigate('send-select-token-from-list'),
    editToken: () => navigation.navigate('send-edit-amount'),
    confirmTx: () => navigation.navigate('send-confirm-tx'),
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  transparent: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
})

const NextButton = Button
const SelectedTokenList = FlatList
