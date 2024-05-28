import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {TokenEmptyList} from '../../../common/TokenEmptyList'
import {ILiquidityPool} from '../../../common/useGetLiquidityPool'
import {useShowLiquidityPoolModal} from '../../../common/useShowLiquidityPoolModal'
import {useStrings} from '../../../common/useStrings'
import {DAppTokenItem} from './DAppTokenItem/DAppTokenItem'

type Props = {
  tokensList: ILiquidityPool[]
  isLoading: boolean
  isSearching: boolean
}
export const LiquidityPoolTab = ({tokensList = [], isLoading, isSearching}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowLiquidityPoolModal()

  const onTokenPress = (liquidityPool?: ILiquidityPool) => {
    if (!liquidityPool) return
    onShow(liquidityPool)
  }

  const renderTokenItem = (item: ILiquidityPool | undefined, index: number) => {
    return (
      <DAppTokenItem
        onPress={() => onTokenPress(item)}
        key={item?.id ?? index}
        tokenInfo={item ? item : undefined}
        splitTokenSymbol="-"
      />
    )
  }

  const renderHeaderList = () => {
    if (isLoading || hasEmpty) return null
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
    if (isLoading)
      return (
        <View style={styles.containerLoading}>{makeList(3).map((_, index) => renderTokenItem(undefined, index))}</View>
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
        renderItem={({item, index}) => renderTokenItem(item, index)}
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
