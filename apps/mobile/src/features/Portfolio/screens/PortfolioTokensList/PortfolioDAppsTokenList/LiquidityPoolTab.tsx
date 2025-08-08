import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, Text, View} from 'react-native'

import {ILiquidityPool} from '~/features/Portfolio/common/hooks/useGetLiquidityPool'
import {useShowLiquidityPoolModal} from '~/features/Portfolio/common/hooks/useShowLiquidityPoolModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {TokenEmptyList} from '~/features/Portfolio/ui/TokenEmptyList/TokenEmptyList'
import {makeList} from '~/kernel/utils'
import {Space} from '~/ui/Space/Space'
import {DAppTokenItem} from './DAppTokenItem/DAppTokenItem'
import {DAppTokenItemSkeleton} from './DAppTokenItem/DAppTokenItemSkeleton'

type Props = {
  tokensList: ILiquidityPool[]
  isFetching: boolean
  isSearching: boolean
}
export const LiquidityPoolTab = ({
  tokensList = [],
  isFetching,
  isSearching,
}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowLiquidityPoolModal()

  const onTokenPress = (liquidityPool?: ILiquidityPool) => {
    if (!liquidityPool) return
    onShow(liquidityPool)
  }

  const renderHeaderList = () => {
    if (hasEmpty) return null
    if (isFetching) return <Space.Height.md />

    if (isSearching)
      return (
        <View>
          <Text style={[a.body_2_md_regular, {color: p.gray_700}]}>
            {strings.portfolio.countLiquidityPoolsAvailable(tokensList.length)}
          </Text>

          <Space.Height.md />
        </View>
      )

    return null
  }

  const renderFooterList = () => {
    if (isFetching)
      return (
        <>
          {tokensList.length !== 0 && <Space.Height.md />}

          <View style={[a.gap_lg]}>
            {makeList(3).map((_, index) => (
              <DAppTokenItemSkeleton key={index} />
            ))}
          </View>
        </>
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
            splitTokenSymbol="-"
          />
        )}
        ListEmptyComponent={
          !isFetching ? (
            <TokenEmptyList emptyText={strings.portfolio.noDataFound} />
          ) : undefined
        }
        contentContainerStyle={[a.flex_1, a.flex_grow]}
      />
    </View>
  )
}
