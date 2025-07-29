import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Space} from '~/ui/Space/Space'
import {makeList} from '~/kernel/utils'
import {ILiquidityPool} from '~/features/Portfolio/common/hooks/useGetLiquidityPool'
import {useShowLiquidityPoolModal} from '~/features/Portfolio/common/hooks/useShowLiquidityPoolModal'
import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {TokenEmptyList} from '~/ui/TokenEmptyList/TokenEmptyList'
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
  const {styles} = useStyles()
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
          <Text style={styles.textAvailable}>
            {strings.countLiquidityPoolsAvailable(tokensList.length)}
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

          <View style={styles.containerLoading}>
            {makeList(3).map((_, index) => (
              <DAppTokenItemSkeleton key={index} />
            ))}
          </View>
        </>
      )

    return null
  }

  return (
    <View style={styles.root}>
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
            <TokenEmptyList emptyText={strings.noDataFound} />
          ) : undefined
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
    },
    listContainer: {
      ...atoms.flex_1,
      ...atoms.flex_grow,
    },
    containerLoading: {
      ...atoms.gap_lg,
    },
    textAvailable: {
      ...atoms.body_2_md_regular,
      color: color.gray_700,
    },
  })

  return {styles} as const
}
