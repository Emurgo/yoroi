import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'

import {IOpenOrders} from '~/features/Portfolio/common/hooks/useGetOpenOrders'
import {useShowOpenOrderModal} from '~/features/Portfolio/common/hooks/useShowOpenOrderModal'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {TokenEmptyList} from '~/features/Portfolio/ui/TokenEmptyList/TokenEmptyList'
import {makeList} from '~/kernel/utils'
import {Space} from '~/ui/Space/Space'
import {DAppTokenItem} from './DAppTokenItem/DAppTokenItem'
import {DAppTokenItemSkeleton} from './DAppTokenItem/DAppTokenItemSkeleton'

type Props = {
  tokensList: IOpenOrders[]
  isFetching: boolean
  isSearching: boolean
}
export const OpenOrdersTab = ({isFetching, tokensList, isSearching}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowOpenOrderModal()

  const onTokenPress = (order?: IOpenOrders) => {
    if (!order) return
    onShow(order)
  }

  const renderHeaderList = () => {
    if (hasEmpty) return null
    if (isFetching) return <Space.Height.md />

    if (isSearching)
      return (
        <View>
          <Text style={[a.body_2_md_regular, {color: p.gray_700}]}>
            {strings.countOpenOrders(tokensList.length)}
          </Text>

          <Space.Height.md />
        </View>
      )

    return null
  }

  const renderFooterList = () => {
    if (isFetching)
      return (
        <View style={[a.gap_lg]}>
          {makeList(3).map((_, index) => (
            <DAppTokenItemSkeleton key={index} />
          ))}
        </View>
      )

    return null
  }

  return (
    <View style={[a.flex_1]}>
      <Space.Height.md />

      <FlatList
        scrollEnabled={false}
        data={tokensList}
        ListHeaderComponent={renderHeaderList()}
        ListFooterComponent={renderFooterList()}
        ItemSeparatorComponent={() => <Space.Width.sm />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <DAppTokenItem
            onPress={() => onTokenPress(item)}
            tokenInfo={item}
            splitTokenSymbol="/"
          />
        )}
        ListEmptyComponent={
          !isFetching ? (
            <TokenEmptyList emptyText={strings.noDataFound} />
          ) : undefined
        }
        contentContainerStyle={[a.flex_1, a.flex_grow]}
      />
    </View>
  )
}
