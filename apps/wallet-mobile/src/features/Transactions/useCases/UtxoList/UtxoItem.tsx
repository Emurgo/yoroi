import {FlashList} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {MiniTokenAmountItem} from '../../../Portfolio/common/TokenAmountItem/MiniTokenAmountItem'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {UtxoList} from './useUtxoList'
export const UtxoItem = ({item}: {item: UtxoList[number]['utxos'][number]}) => {
  const {styles, colors} = useStyles()
  const {wallet} = useSelectedWallet()
  const {navigateToTxDetails} = useWalletNavigation()
  const {tokenInfos = new Map<Portfolio.Token.Id, Portfolio.Token.Info>()} = usePortfolioTokenInfos({
    wallet,
    tokenIds: Object.keys(item.balance) as Portfolio.Token.Id[],
    sourceId: 'UtxoList',
  })

  const utxoId = `${item.txHash}#${item.txIndex}`

  if (tokenInfos === undefined) return <ActivityIndicator size={22} color={colors.indicator} />

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateToTxDetails(item.txHash)}>
        <Text style={styles.text}>{utxoId}</Text>
      </TouchableOpacity>

      <FlashList
        data={Object.entries(item.balance)}
        contentContainerStyle={styles.content}
        renderItem={({item: [id, qty]}) => {
          const quantity = BigInt(qty)
          const info = tokenInfos.get(id as Portfolio.Token.Id)
          if (!info) return null
          return <MiniTokenAmountItem amount={{quantity, info}} />
        }}
        ItemSeparatorComponent={() => <Space height="md" />}
        keyExtractor={(_, index) => index.toString()}
        nestedScrollEnabled={true}
        testID="utxoItem"
        estimatedItemSize={32}
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    container: {
      ...atoms.flex,
      ...atoms.flex_1,
      ...atoms.p_sm,
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.el_gray_max,
    },
    content: {
      ...atoms.p_md,
    },
  })

  const colors = {
    indicator: color.el_gray_medium,
  }

  return {styles, colors}
}
