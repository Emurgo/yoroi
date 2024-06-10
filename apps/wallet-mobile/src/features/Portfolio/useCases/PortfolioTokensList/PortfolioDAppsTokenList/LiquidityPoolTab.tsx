import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {makeList} from '../../../../../kernel/utils'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {ILiquidityPool} from '../../../common/useGetLiquidityPool'
import {useShowLiquidityPoolModal} from '../../../common/useShowLiquidityPoolModal'
import {useStrings} from '../../../common/useStrings'
import {DAppTokenItem} from './DAppTokenItem/DAppTokenItem'
import {DAppTokenItemSkeleton} from './DAppTokenItem/DAppTokenItemSkeleton'

type Props = {
  tokensList: ILiquidityPool[]
  isFetching: boolean
  isSearching: boolean
}
export const LiquidityPoolTab = ({tokensList = [], isFetching, isSearching}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowLiquidityPoolModal()

  const onTokenPress = (liquidityPool?: ILiquidityPool) => {
    if (!liquidityPool) return
    onShow(liquidityPool)
  }

  const renderHeaderList = () => {
    if (isFetching || hasEmpty) return null
    if (isSearching)
      return (
        <View>
          <Text style={styles.textAvailable}>{strings.countLiquidityPoolsAvailable(tokensList.length)}</Text>

          <Spacer height={16} />
        </View>
      )

    return null
  }

  const renderFooterList = () => {
    if (isFetching)
      return (
        <View style={styles.containerLoading}>
          {makeList(3).map((_, index) => (
            <DAppTokenItemSkeleton key={index} />
          ))}
        </View>
      )
    if (hasEmpty) return <TokenEmptyList emptyText={strings.noDataFound} />

    return null
  }

  return (
    <View style={styles.root}>
      <Spacer height={16} />

      <FlatList
        scrollEnabled={false}
        data={tokensList}
        ListHeaderComponent={renderHeaderList()}
        ListFooterComponent={renderFooterList()}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <DAppTokenItem onPress={() => onTokenPress(item)} tokenInfo={item} splitTokenSymbol="-" />
        )}
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
    containerLoading: {
      ...atoms.gap_lg,
    },
    textAvailable: {
      ...atoms.body_2_md_regular,
      color: color.gray_c700,
    },
  })

  return {styles} as const
}