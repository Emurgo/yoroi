import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Button, Spacer} from '../../../components'
import {AssetItem} from '../../../components/AssetItem'
import globalMessages from '../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../navigation'
import {useSelectedWallet} from '../../../SelectedWallet'
import {COLORS} from '../../../theme'
import {sortTokenInfos} from '../../../utils'
import {useTokenInfo, useTokenInfos} from '../../../yoroi-wallets/hooks'
import {TokenId, TokenInfo, YoroiAmount} from '../../../yoroi-wallets/types'
import {Amounts} from '../../../yoroi-wallets/utils'
import {useSend} from '../../shared/SendContext'
import {AddToken} from './AddToken/AddToken'
import {DeleteToken} from './DeleteToken'

export const ListSelectedTokensScreen = () => {
  const {targets, selectedTargetIndex, tokenSelectedChanged, amountRemoved} = useSend()
  const {amounts} = targets[selectedTargetIndex].entry
  const navigateTo = useNavigateTo()
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(amounts).map(({tokenId}) => tokenId),
  })
  const tokens = sortTokenInfos({wallet, tokenInfos})

  const onSelect = (tokenId: TokenId) => {
    tokenSelectedChanged(tokenId)
    navigateTo.editToken()
  }
  const onDelete = (tokenId: TokenId) => {
    amountRemoved(tokenId)
  }
  const onAdd = navigateTo.addToken
  const onNext = () => console.log('build tx')

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <FlatList
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

          <AddToken onPress={onAdd} />
        </Row>

        <Spacer height={33} />

        <Button onPress={onNext} title={strings.next} shelleyTheme />
      </Actions>
    </SafeAreaView>
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
    addToken: () => navigation.navigate('send-select-token'),
    editToken: () => navigation.navigate('send-edit-token-amount'),
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
