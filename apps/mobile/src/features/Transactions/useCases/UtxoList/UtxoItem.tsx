import {FlashList} from '@shopify/flash-list'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {MiniTokenAmountItem} from '~/features/Portfolio/common/TokenAmountItem/MiniTokenAmountItem'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletNavigation} from '~/kernel/navigation/hooks'
import {Space} from '~/ui/Space/Space'
import {UtxoList} from './useUtxoList'

export const UtxoItem = ({item}: {item: UtxoList[number]['utxos'][number]}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {navigateToTxDetails} = useWalletNavigation()
  const {tokenInfos = new Map<Portfolio.Token.Id, Portfolio.Token.Info>()} =
    usePortfolioTokenInfos({
      wallet,
      tokenIds: Object.keys(item.balance) as Portfolio.Token.Id[],
      sourceId: 'UtxoList',
    })

  const utxoId = `${item.txHash}#${item.txIndex}`

  if (tokenInfos === undefined)
    return <ActivityIndicator size={22} color={p.el_gray_medium} />

  return (
    <View style={[a.flex, a.flex_1, a.p_sm]}>
      <TouchableOpacity onPress={() => navigateToTxDetails(item.txHash)}>
        <Text style={[{color: p.el_gray_max}, a.body_2_md_regular]}>
          {utxoId}
        </Text>
      </TouchableOpacity>

      <FlashList
        data={Object.entries(item.balance)}
        contentContainerStyle={a.p_md}
        renderItem={({item: [id, qty]}) => {
          const quantity = BigInt(qty)
          const info = tokenInfos.get(id as Portfolio.Token.Id)
          if (!info) return null
          return <MiniTokenAmountItem amount={{quantity, info}} />
        }}
        ItemSeparatorComponent={() => <Space.Height.md />}
        keyExtractor={(_, index) => index.toString()}
        nestedScrollEnabled={true}
        testID="utxoItem"
        estimatedItemSize={32}
      />
    </View>
  )
}
