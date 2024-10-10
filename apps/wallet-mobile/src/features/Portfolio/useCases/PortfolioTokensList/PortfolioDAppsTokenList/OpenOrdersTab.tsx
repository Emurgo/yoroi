import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer/Spacer'
import {makeList} from '../../../../../kernel/utils'
import {IOpenOrders} from '../../../common/hooks/useGetOpenOrders'
import {useShowOpenOrderModal} from '../../../common/hooks/useShowOpenOrderModal'
import {useStrings} from '../../../common/hooks/useStrings'
import {TokenEmptyList} from '../../../common/TokenEmptyList/TokenEmptyList'
import {DAppTokenItem} from './DAppTokenItem/DAppTokenItem'
import {DAppTokenItemSkeleton} from './DAppTokenItem/DAppTokenItemSkeleton'

type Props = {
  tokensList: IOpenOrders[]
  isFetching: boolean
  isSearching: boolean
}
export const OpenOrdersTab = ({isFetching, tokensList, isSearching}: Props) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const hasEmpty = tokensList.length === 0

  const {onShow} = useShowOpenOrderModal()

  const onTokenPress = (order?: IOpenOrders) => {
    if (!order) return
    onShow(order)
  }

  const renderHeaderList = () => {
    if (hasEmpty) return null
    if (isFetching) return <Spacer height={16} />

    if (isSearching)
      return (
        <View>
          <Text style={styles.textAvailable}>{strings.countOpenOrders(tokensList.length)}</Text>

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
          <DAppTokenItem onPress={() => onTokenPress(item)} tokenInfo={item} splitTokenSymbol="/" />
        )}
        ListEmptyComponent={!isFetching ? <TokenEmptyList emptyText={strings.noDataFound} /> : undefined}
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
