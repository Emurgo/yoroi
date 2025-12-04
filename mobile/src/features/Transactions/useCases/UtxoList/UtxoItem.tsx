import {atoms as a, useTheme} from '@yoroi/theme'
import type {ModernUtxo} from '@yoroi/tx'
import {Portfolio} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {FlashList} from '@shopify/flash-list'
import * as React from 'react'
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native'

import {usePortfolioTokenInfos} from '~/features/Portfolio/common/hooks/usePortfolioTokenInfos'
import {MiniTokenAmountItem} from '~/features/Portfolio/ui/TokenAmountItem/MiniTokenAmountItem'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Space} from '~/ui/Space/Space'

const UtxoItemComponent = ({item}: {item: ModernUtxo}) => {
  const {atoms: ta, palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {navigateToTxDetails} = useWalletNavigation()
  const tokenIds = Object.keys(item.balance) as Portfolio.Token.Id[]
  const {tokenInfos, isLoading} = usePortfolioTokenInfos({
    wallet,
    tokenIds,
    sourceId: 'UtxoList',
  })

  const utxoId = `${item.txHash}#${item.txIndex}`

  if (isLoading || !tokenInfos)
    return <ActivityIndicator size={22} color={p.el_gray_medium} />

  return (
    <View style={[a.flex, a.flex_1, a.p_sm]}>
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <TouchableOpacity onPress={() => navigateToTxDetails(item.txHash)}>
          <Text style={[ta.text_gray_max, a.body_2_md_regular]}>{utxoId}</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={Object.entries(item.balance)}
        contentContainerStyle={a.p_md}
        renderItem={({item: [id, qty]}) => {
          const quantity = BigInt(qty)
          const info = tokenInfos?.get?.(id as Portfolio.Token.Id)
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

export const UtxoItem = React.memo(
  UtxoItemComponent,
  (prevProps, nextProps) => {
    // Only re-render if UTXO identifier changes
    return (
      `${prevProps.item.txHash}#${prevProps.item.txIndex}` ===
      `${nextProps.item.txHash}#${nextProps.item.txIndex}`
    )
  },
)
